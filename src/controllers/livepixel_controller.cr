require "redis"
require "sanitize"
require "http"
require "uri"
require "base64"
require "digest"
require "slack"

#paypal
CLIENT_ID = "AXEHRTl5y4XYIOuuIJ7CT5TE5v0CLNViXwk7CD8F5DhAT6JTKoF9jWJMr71f5W_BsSS9gnp8hjSPunFL"
CLIENT_SECRET = "ENuzq-_Qx1_N-wmaB_Io5ajTJAjucGzd3bqaKStziSksTfWJqkg-cNT4uIppBWIL4txlc9WEwGKjRvLq"

class LivepixelController < ApplicationController

  def parse_command
    # command = Slack::SlashCommand.from_request_body(request.body.to_s)

    command = params["command"].to_s
    response_url = params["response_url"].to_s

    # # create private room

    if command.includes?("harmonize")

      url = "https://gbaldraw.fun/canvas?room=#{UUID.random.to_s}"

      message = {text: "Harmony collaborative meeting launched. #{url}"}.to_h
      # headers = HTTP::Headers{"Content-Type" => "application/json"}
      # response = HTTP::Client.post(url, headers: headers, body: JSON.stringify(message))

      uri = URI.parse(response_url)

      client = HTTP::Client.new uri
  
      client.before_request do |request|
          request.headers["Content-Type"] = "application/json"
          request.body = message.to_json
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post(uri.path)

      # message.send_to_hook "#{redirect_url}&token=xoxb-2208532755014-2220375245923-6tqDaaFr8mg5KI9z0ej5b5jw"
      if response.body.to_s == "ok"
        return "Harmonization successful. Join at the link above."
      end
      # api = Slack::API.new "xoxb-2208532755014-2220375245923-6tqDaaFr8mg5KI9z0ej5b5jw"
      # api.post_message(message)

    end

    return ""
  
  end

  def landing
    render("landing.ecr")
  end


  def gallery
    redis = Redis.new("127.0.0.1", 6379)

    image_ids = redis.lrange("gallery", 0, -1)

    render("gallery.ecr", layout: "gallery.ecr")
  end

  def gallery_feed
    redis = Redis.new("127.0.0.1", 6379)

    image_ids = redis.lrange("gallery", 0, -1)
    respond_with do
      xml render("gallery_feed.xml.ecr", layout: false)
    end
  end


  # imgur client id 3e035ba859d6add
  def upload_to_imgur

    redis = Redis.new("127.0.0.1", 6379)

    path = params.files["picture"].file.path

    url = URI.parse("https://api.imgur.com/3/image")

    IO.pipe do |reader, writer|
      channel = Channel(String).new(1)

      spawn do
        HTTP::FormData.build(writer) do |formdata|
          channel.send(formdata.content_type)

          formdata.field("name", "foo")
          File.open(path) do |file|
            metadata = HTTP::FormData::FileMetadata.new(filename: "foo.png")
            headers = HTTP::Headers{"Content-Type" => "image/png"}
            formdata.file("image", file, metadata, headers)
          end
        end

        writer.close
      end

      client = HTTP::Client.new url

      client.before_request do |request|
          request.headers["Authorization"] = "Client-ID 3e035ba859d6add"
          request.headers["Content-Type"] = channel.receive
          request.body = reader.gets_to_end
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post("/3/image")

      puts "Response code #{response.status_code}"
      puts response.body

      id = JSON.parse(response.body).as_h["data"].as_h["id"].to_s

      redis.rpush("gallery", id)

      response.body.to_s
    end
    
  end

  def clear_canvas
    room = params[:room]
    puts "room: #{room}"
    raise "cant clear global canvas" if params[:room].blank? || params[:room].nil?
    redis = Redis.new("127.0.0.1", 6379)
    redis.del("packets_#{room}")
    CanvasSocket.broadcast("message", "canvas:#{room}", "message_new", {clear: true}.to_h)
  end

  def canvas
    # Sanitizer = Sanitize::Policy::HTMLSanitizer.basic
    random_number = Random.rand(10000).to_i
    room = params[:room] rescue ""
    redis = Redis.new("127.0.0.1", 6379)
    if room == ""
      ttl = redis.ttl("packets")
    else
      ttl = redis.ttl("packets_#{room}")
    end
    counter = redis.incr("counter")

    ad = ""
    banner_link = ""
    while ad == ""
      order_id = redis.srandmember("banner_order_ids").to_s
      break if order_id == ""
      ad = redis.get(order_id) || ""
      banner_link = redis.get("#{order_id}_link") || ""
      if ad == ""
        redis.srem("banner_order_ids", order_id)
      else
        break
      end
    end

    if ad == ""
      ad = File.read("./public/default_ad.base64").to_s
      banner_link = "https://gbaldraw.fun/buy_ad"
    end

    chats = ""
    if room == ""
      amt_packets = redis.llen("chats")
      if amt_packets >= 100
        chats = redis.lrange("chats", -100, -1)
      else
        chats = redis.lrange("chats", 0, -1)
      end
    else
      amt_packets = redis.llen("chats_#{params[:room]}")
      if amt_packets >= 100
        chats = redis.lrange("chats_#{params[:room]}", -100, -1)
      else
        chats = redis.lrange("chats_#{params[:room]}", 0, -1)
      end
    end

    render "canvas.ecr", layout: "gbaldraw.ecr"
  end

  def random_ad
    redis = Redis.new("127.0.0.1", 6379)
    # Sanitizer = Sanitize::Policy::HTMLSanitizer.basic
    ad = ""
    banner_link = ""
    while ad == ""
      order_id = redis.srandmember("banner_order_ids").to_s
      break if order_id == ""
      ad = redis.get(order_id) || ""
      banner_link = redis.get("#{order_id}_link") || ""
      if ad == ""
        redis.srem("banner_order_ids", order_id)
      else
        break
      end
    end

    if ad == ""
      ad = File.read("./public/default_ad.base64").to_s
      banner_link = "https://gbaldraw.fun/buy_ad"
    end
    
    {ad: Sanitizer.process(ad), banner_link: Sanitizer.process(banner_link)}.to_h.to_json
  end


  def stats
    room = params[:room] rescue nil
    redis = Redis.new("127.0.0.1", 6379)
    if room == "" || room == nil
      redis_packets_str = "packets"
      amt_packets = redis.llen(redis_packets_str)
      if amt_packets >= 50000
        packets = redis.lrange(redis_packets_str, -50000, -1)
      else
        packets = redis.lrange(redis_packets_str, 0, -1)
      end
    else
      redis_packets_str = "packets_#{room}"
      amt_packets = redis.llen(redis_packets_str)
      if amt_packets >= 50000
        packets = redis.lrange(redis_packets_str, -50000, -1)
      else
        packets = redis.lrange(redis_packets_str, 0, -1)
      end
    end
    names = packets.map { |p| JSON.parse(p.to_s)["name"] }.uniq
    points = {} of String => String
    names.each { |n| points[n.to_s] = packets.reject {|pa| JSON.parse(pa.to_s)["name"] != n}.size.to_s }
    layers = {} of String => String
    names.each { |n| layers[n.to_s] = packets.select {|pac| js = JSON.parse(pac.to_s); js["name"] == n && js.as_h.has_key?("dragging") && js["dragging"] == false}.size.to_s }
    all_layers = 0
    layers.each do |layer|
      all_layers += layer[1].to_i
    end
    names = names.sort { |a,b| points[b.to_s].to_i <=> points[a.to_s].to_i }
    all_time = {} of String => String
    redis.hgetall("all_time").each_slice(2) { |drawer| all_time[drawer[0].to_s] = drawer[1].to_s }
    puts all_time
    render("stats.ecr", layout: "stats.ecr")
  end

  def privacy_policy
    render("privacy_policy.ecr")
  end

  def buy_ad
    render("buy_ad.ecr", layout: "buy_ad.ecr")
  end

  def create_order
    puts params.inspect

    debug = true

    body = {
  
      "intent": "CAPTURE",
    
      "purchase_units": [
    
        {
    
          "amount": {
    
            "currency_code": "USD",
    
            "value": "10.00"
    
          }
    
        }
    
      ]
    
    }.to_h.to_json
    headers = HTTP::Headers{"Prefer" => "return=representation", "Content-Type" => "application/json", "Authorization" => "Basic #{Base64.strict_encode("#{CLIENT_ID}:#{CLIENT_SECRET}")}"}
    response = HTTP::Client.post("https://api.paypal.com/v2/checkout/orders", headers, body)
    
    puts response.body

    response.body.to_json

    end

    def capture_order
      debug = true
      order_id = params["orderID"]
      headers = HTTP::Headers{"Prefer" => "return=representation", "Content-Type" => "application/json", "Authorization" => "Basic #{Base64.strict_encode("#{CLIENT_ID}:#{CLIENT_SECRET}")}"}
      response = HTTP::Client.post("https://api.paypal.com/v2/checkout/orders/#{order_id}/capture", headers)
      
      json = JSON.parse(response.body)
      id = json["id"]

      email = json["payer"]["email_address"]
  
      redis = Redis.new("127.0.0.1", 6379)
      redis.hset("completed_orders", email, id)
  
      response.body.to_json
    end

    def upload
      # require 'dimensions'
      path = params.files["banner"].file.path
      # if uploaded_io.size > 2.megabytes
      #   Rails.logger.info "Someone attempted to upload an ad with a file size too big."
      #   render js: 'alert("Uploaded file is too big. Limit 2 megabytes.")'
      #   return
      # end
      # size = Dimensions.dimensions(uploaded_io.path)
      # if size[0] > 468 || size[1] > 60
      #   Rails.logger.info "Someone attempted to upload an ad with a dimensions too big."
      #   render js: 'alert("Uploaded file dimensions too big. Limit 468x60.")'
      #   return
      # end
      email = params[:email]
      link = params[:link]
      order_id = params[:order_id]
      redis = Redis.new("127.0.0.1", 6379)
      paid = redis.hget("completed_orders", email)
      puts paid
      if paid != nil
        # write image to redis
        base64 = Base64.strict_encode(File.read(path))
        puts base64
        redis.set(order_id, base64)
        redis.set("#{order_id}_link", link)
        redis.expire("#{order_id}_link", 2592000)
        redis.expire(order_id, 2592000)
        redis.sadd("banner_order_ids", order_id)
        "alert('Your ad was successfully added to the rotation.')"
      else
        puts "Hack attempt? No order id found for #{email}"
        "alert('Order id not found. Your ad was not successfully added to the rotation.')"
      end
      # File.open(Rails.root.join('public', 'uploads', uploaded_io.original_filename), 'w') do |file|
      #   file.write(uploaded_io.read)
      # end
      # create base64 image from uploaded_io
    end

    def active_users
      {active_users: (Amber::WebSockets::ClientSockets.client_sockets.size / 4).to_f.round(0).to_i }.to_h.to_json
    end

    def upload_to_scalable_press

      redis = Redis.new("127.0.0.1", 6379)
  
      file_url = params["file_url"] rescue ""

      path = ""
      save_name = ""
      random_file : File = File.new("temp.png", "w")

      if file_url == ""
        path = params.files["picture"].file.path

        save_name = "#{Random.rand(10000).to_i}.png"
        random_file = File.open("public/#{save_name}", "w") do |file|
            file << File.open(path).gets_to_end
        end
        file_url = "https://gbaldraw.fun/#{save_name}"
      else
        response = HTTP::Client.get(file_url)
        save_name = "#{Random.rand(10000).to_i}.png"
        random_file = File.open("public/#{save_name}", "w") do |file|
            file << response.body
        end
        # file_url = "https://gbaldraw.fun/#{save_name}"
      end
      puts path
  
      url = URI.parse("https://api.scalablepress.com/v2/design")
  
      IO.pipe do |reader, writer|
        scalable_channel = Channel(String).new(1)
  
        spawn do
          HTTP::FormData.build(writer) do |formdata|
            scalable_channel.send(formdata.content_type)
  
            
            # File.open(path) do |file|
              # metadata = HTTP::FormData::FileMetadata.new(filename: "foo.png")
              # headers = HTTP::Headers{"Content-Type" => "image/png"}
              
              # formdata.field("sides[front]", 1.0)
              # formdata.field("products[0][id]", "gildan-sweatshirt-crew")
              # formdata.field("products[0][color]", "ash")
              # formdata.field("products[0][quantity]", 1)
              # formdata.field("products[0][size]", "lrg")
              # formdata.field("sides[front][colors][0]", "white")
              # formdata.file("sides[front][artwork]", file, metadata, headers)
              formdata.field("sides[front][artwork]", file_url)
              formdata.field("type", "dtg")
              formdata.field("sides[front][dimensions][width]", "14")
              formdata.field("sides[front][position][horizontal]", "C")
              formdata.field("sides[front][position][offset][top]", "0")
            # end
          end
  
          writer.close
        end
  
        client = HTTP::Client.new url
  
        client.before_request do |request|
            request.headers["Authorization"] = "Basic #{Base64.strict_encode(":live_B3u4MwvA4almkU-49Jw9Wg")}"
            request.headers["Content-Type"] = scalable_channel.receive
            request.body = reader.gets_to_end
            request.content_length = request.body.to_s.bytesize
        end
        response = client.post("/v2/design")
  
        puts "Response code #{response.status_code}"
        puts response.body

        json = JSON.parse(response.body).as_h

        File.open("public/#{json["designId"]}.png", "w") do |file|
            file << File.open(random_file.path).gets_to_end
        end

        File.delete(random_file.path)

        response.body.to_s
      end



    end


    def show_scalable_product_categories

      design_id = params["designId"]

      url = URI.parse("https://api.scalablepress.com/v2/categories")

      client = HTTP::Client.new(url)
      client.before_request do |request|
        request.headers["Authorization"] = "Basic #{Base64.strict_encode(":live_B3u4MwvA4almkU-49Jw9Wg")}"
      end
      response = client.get "/v2/categories"

      categories = JSON.parse(response.body)

      puts categories

      render("show_scalable_product_categories.ecr")
    end

    def show_scalable_products

      design_id = params["design_id"]
      category_id = params["category_id"]

      url = URI.parse("https://api.scalablepress.com/v2/categories/#{category_id}")

      client = HTTP::Client.new(url)
      client.before_request do |request|
        request.headers["Authorization"] = "Basic #{Base64.strict_encode(":live_B3u4MwvA4almkU-49Jw9Wg")}"
      end
      response = client.get "/v2/categories/#{category_id}"

      puts response.body

      products = JSON.parse(response.body).as_h["products"].as_a

      puts products

      render("show_scalable_products.ecr")
    end


    def show_scalable_mockup

      product_id = params["product_id"]
      design_id = params["design_id"]
      color = params["color"] rescue "White"

      url = URI.parse("https://api.scalablepress.com/v3/mockup")
  
      IO.pipe do |reader, writer|
        scalable_channel = Channel(String).new(1)
  
        spawn do
          HTTP::FormData.build(writer) do |formdata|
            scalable_channel.send(formdata.content_type)

              
              formdata.field("template[name]", "front")
              formdata.field("product[id]", product_id)
              formdata.field("product[color]", color)
              formdata.field("design[type]", "dtg")
              formdata.field("design[sides][front][artwork]", "https://gbaldraw.fun/#{design_id}.png")
              formdata.field("design[sides][front][dimensions][width]", "14")
              formdata.field("design[sides][front][position][horizontal]", "C")
              formdata.field("design[sides][front][position][offset][top]", "0")
              formdata.field("output[width]", "1000")
              formdata.field("output[height]", "1000")
              formdata.field("padding[height]", "10")
              formdata.field("output[format]", "png")

          end
  
          writer.close
        end
  
        client = HTTP::Client.new url
  
        client.before_request do |request|
            request.headers["Authorization"] = "Basic #{Base64.strict_encode(":live_B3u4MwvA4almkU-49Jw9Wg")}"
            request.headers["Content-Type"] = scalable_channel.receive
            request.body = reader.gets_to_end
            request.content_length = request.body.to_s.bytesize
        end
        response = client.post("/v3/mockup")
  
        puts "Response code #{response.status_code}"
        puts response.body

        json = JSON.parse(response.body.to_s).as_h
        mockup = json["url"] rescue ""

        product = JSON.parse(HTTP::Client.get("https://api.scalablepress.com/v2/products/#{product_id}").body).as_h


        puts product.inspect

        render("show_scalable_mockup.ecr")
      end

    end

    def get_scalable_quote

      redis = Redis.new("127.0.0.1", 6379)

      product_id = params["product_id"]
      design_id = params["design_id"]
      color = params["color"] rescue "White"
      quantity = params["quantity"]
      size = params["size"] rescue "med"
      name = params["name"]
      address = params["address"]
      city = params["city"]
      state = params["state"]
      zipcode = params["zipcode"]

      begin
        File.delete("public/#{design_id}.png")
      rescue exception
        puts exception.message
      end
      

      url = URI.parse("https://api.scalablepress.com/v2/quote")

      client = HTTP::Client.new(url)
      body_string = "type=dtg&products[0][id]=#{product_id}&products[0][color]=#{color}&products[0][quantity]=#{quantity}&products[0][size]=#{size}&address[name]=#{name}&address[address1]=#{address}&address[city]=#{city}&address[state]=#{state}&address[zip]=#{zipcode}&designId=#{design_id}"
      client.before_request do |request|
        request.headers["Authorization"] = "Basic #{Base64.strict_encode(":live_B3u4MwvA4almkU-49Jw9Wg")}"
        request.headers["Content-Type"] = "application/x-www-form-urlencoded"
      end
      
      response = client.post "/v2/quote", body: body_string

      quote = JSON.parse(response.body).as_h

      puts quote.inspect


      total = ((quote["total"].as_f * 0.35) + quote["total"].as_f).round(2)

      order_token = quote["orderToken"].to_s

      puts "selling #{quote["total"]} for #{total}"
      debug = true
  
      body = {
    
        "intent": "CAPTURE",
      
        "purchase_units": [
      
          {
      
            "amount": {
      
              "currency_code": "USD",
      
              "value": total
      
            }
      
          }
      
        ]
      
      }.to_h.to_json
      headers = HTTP::Headers{"Prefer" => "return=representation", "Content-Type" => "application/json", "Authorization" => "Basic #{Base64.strict_encode("#{CLIENT_ID}:#{CLIENT_SECRET}")}"}
      response = HTTP::Client.post("https://api.paypal.com/v2/checkout/orders", headers, body)
      
      puts response.body

      id = JSON.parse(response.body)["id"]

      raise "blank order token" if order_token == ""

      redis.set("tshirt_order_#{id}", order_token)
  
      response.body.to_json
      # {"id" => JSON.parse(response.body).as_h["id"], "order_token" => order_token}.to_json
    end

    def place_scalable_order
      redis = Redis.new("127.0.0.1", 6379)
      
      product_id = params["product_id"]


      debug = true
      order_id = params["orderID"]
      
      order_token = redis.get("tshirt_order_#{order_id}")
      headers = HTTP::Headers{"Prefer" => "return=representation", "Content-Type" => "application/json", "Authorization" => "Basic #{Base64.strict_encode("#{CLIENT_ID}:#{CLIENT_SECRET}")}"}
      response = HTTP::Client.post("https://api.paypal.com/v2/checkout/orders/#{order_id}/capture", headers)
    
      puts response.body

      paypal_response = response.body

      json = JSON.parse(response.body)
      id = json["id"]

      email = json["payer"]["email_address"]
  
      redis = Redis.new("127.0.0.1", 6379)
      redis.hset("completed_tshirt_orders", email, id)
  
      



      url = URI.parse("https://api.scalablepress.com/v2/order")

      client = HTTP::Client.new(url)
      body_string = "orderToken=#{order_token}"
      client.before_request do |request|
        request.headers["Authorization"] = "Basic #{Base64.strict_encode(":live_B3u4MwvA4almkU-49Jw9Wg")}"
        request.headers["Content-Type"] = "application/x-www-form-urlencoded"
      end
      
      response = client.post "/v2/order", body: body_string

      # redis.set("scalable_order_#{JSON.parse(response.body).as_h["orderId"]}", id)

      redis.hset("scalable_order_ids", id, JSON.parse(response.body).as_h["orderId"])

      puts response.body

      paypal_response.to_json
    end


    def receipt
      transaction_id = params["transaction_id"]
      redis = Redis.new("127.0.0.1", 6379)
      order_id = redis.hget("scalable_order_ids", transaction_id)

      url = URI.parse("https://api.scalablepress.com/v3/event?orderId=#{order_id}")

      client = HTTP::Client.new(url)
      client.before_request do |request|
        request.headers["Authorization"] = "Basic #{Base64.strict_encode(":live_B3u4MwvA4almkU-49Jw9Wg")}"
      end
      
      response = client.get "/v3/event?orderId=#{order_id}"

      puts response.body

      receipts = JSON.parse(response.body).as_a

      render("receipt.ecr")
    end

end
