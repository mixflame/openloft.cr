require "redis"
require "sanitize"
require "http"
require "uri"
require "base64"
require "digest"
require "slack"

#paypal
CLIENT_ID = Amber.settings.secrets["PAYPAL_CLIENT_ID"]
CLIENT_SECRET = Amber.settings.secrets["PAYPAL_CLIENT_SECRET"]

#slack
SLACK_SIGNING_SECRET = Amber.settings.secrets["SLACK_SIGNING_SECRET"]

class LivepixelController < ApplicationController


  def event_subscription
    # token = params[:token]
    # challenge = params[:challenge]
    # event = params[:event]
    # type = params[:type]
    json = JSON.parse(request.body.as(IO).gets_to_end)
    token = json["token"].to_s
    challenge = json["challenge"].to_s
    event = json["event"].as_h
    type = json["type"].to_s
    channel_id = event["channel"]["id"]

    timestamp = request.headers["X-Slack-Request-Timestamp"]
    if (Time.utc.to_unix - timestamp.to_i).abs > 60 * 5
      # The request timestamp is more than five minutes from local time.
      # It could be a replay attack, so let's ignore it.
      return
    end
    # sig_basestring = "v0:" + timestamp + ":" + request.body.as(IO).gets_to_end.to_s
    # puts "sig_basestring: #{sig_basestring}"
    # # my_signature = 'v0=' + hmac.compute_hash_sha256(
    # # slack_signing_secret,
    # # sig_basestring
    # # ).hexdigest()
    # my_signature = "v0=" + OpenSSL::HMAC.hexdigest(:sha256, SLACK_SIGNING_SECRET, sig_basestring)
    # puts "my signature: #{my_signature}"
    # slack_signature = request.headers["X-Slack-Signature"]
    # puts "slack signature: #{slack_signature}"
    # if my_signature != slack_signature
    #   # Signature mismatch.
    #   return
    # end
    if params[:token] != "SLACK_TOKEN"
      # Token mismatch.
      return
    end

    if type == "link_shared"
      # https://slack.com/api/calls.add
      url = event[:links].as_a[0].as_h[:url].to_s
      id = url.split("=")[1].to_s
      puts "url: #{url} id: #{id}"
      message = {
        "external_unique_id" => id,
        "join_url" => url,
      }.to_h
      headers = HTTP::Headers{"Content-Type" => "application/json"}
  
      uri = URI.parse("https://slack.com/api/calls.add")
  
      client = HTTP::Client.new uri
  
      client.before_request do |request|
          request.headers["Authorization"] = "Bearer #{Amber.settings.secrets["SLACK_ID_TOKEN"]}"
          request.headers["Content-Type"] = "application/json"
          request.body = message.to_json
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post(uri.path)

      call_id = JSON.parse(response.body.to_s)["call"].as_h["id"].to_s

      redis = REDIS
      redis.set("#{id}_slack_call_id", call_id)

      puts "calls.add: #{response.body.to_s}"


      # https://slack.com/api/chat.unfurl

      message = {
        "channel" => channel_id,
        "ts" => event[:event_ts],
        "unfurls" => { 
          url => { 
            "type": "call",
            "call_id": id
          }
        },
      }.to_h
      headers = HTTP::Headers{"Content-Type" => "application/json"}
  
      uri = URI.parse("https://slack.com/api/chat.unfurl")
  
      client = HTTP::Client.new uri
  
      client.before_request do |request|
          request.headers["Authorization"] = "Bearer #{Amber.settings.secrets["SLACK_ID_TOKEN"]}"
          request.headers["Content-Type"] = "application/json"
          request.body = message.to_json
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post(uri.path)

      puts "chat.unfurl: #{response.body.to_s}"

    end
    
    
    return {challenge: challenge}.to_json
  end

  def parse_command
    # command = Slack::SlashCommand.from_request_body(request.body.to_s)

    command = params["command"].to_s
    response_url = params["response_url"].to_s
    # channel = params["channel"].to_s

    # # create private room

    id = UUID.random.to_s

    url = "https://openloft.org/canvas?room=#{id}"

      message = {
        "response_type" => "call",
        "call_initiation_url" => url,
        "desktop_protocol_call_initiation_url" => url
      }.to_h
      headers = HTTP::Headers{"Content-Type" => "application/json"}

      uri = URI.parse(response_url)
  
      client = HTTP::Client.new uri
  
      client.before_request do |request|
          request.headers["Content-Type"] = "application/json"
          request.body = message.to_json
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post(uri.path)

      puts "quick ack: #{response.body.to_s}"

      # https://slack.com/api/calls.add

      message = {
        "external_unique_id" => id,
        "join_url" => url,
      }.to_h
      headers = HTTP::Headers{"Content-Type" => "application/json"}
  
      uri = URI.parse("https://slack.com/api/calls.add")
  
      client = HTTP::Client.new uri
  
      client.before_request do |request|
          request.headers["Authorization"] = "Bearer #{Amber.settings.secrets["SLACK_ID_TOKEN"]}"
          request.headers["Content-Type"] = "application/json"
          request.body = message.to_json
          request.content_length = request.body.to_s.bytesize
      end
      response = client.post(uri.path)

      call_id = JSON.parse(response.body.to_s)["call"].as_h["id"].to_s

      redis = REDIS
      redis.set("#{id}_slack_call_id", call_id)

      puts "calls.add: #{response.body.to_s}"

    # end

    message = {
      text: "Join here: #{url}",
      response_type: "in_channel",
      blocks: [{
        type: "call",
        call_id: id,
      }]
    }.to_h

    return message.to_json
  
  end

  def landing
    redis = REDIS
    public_rooms = redis.lrange "public_rooms", 0, -1
    render("landing.ecr")
  end


  def gallery
    redis = REDIS

    image_ids = redis.lrange("gallery", 0, -1)

    render("gallery.ecr", layout: "gallery.ecr")
  end

  def gallery_feed
    redis = REDIS

    image_ids = redis.lrange("gallery", 0, -1)
    respond_with do
      xml render("gallery_feed.xml.ecr", layout: false)
    end
  end


  # imgur client id 3e035ba859d6add
  def upload_to_imgur

    redis = REDIS

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
          request.headers["Authorization"] = "Client-ID IMGUR_TOKEN"
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

  # def clear_canvas
  #   room = params[:room]
  #   puts "room: #{room}"
  #   raise "cant clear global canvas" if params[:room].blank? || params[:room].nil?
  #   redis = REDIS
  #   redis.del("packets_#{room}")
  #   CanvasSocket.broadcast("message", "canvas:#{room}", "message_new", {clear: true}.to_h)
  # end

  def canvas
    # Sanitizer = Sanitize::Policy::HTMLSanitizer.basic

    random_number = Random.rand(2000000).to_i
    room = params[:room] rescue ""
    redis = REDIS

    media_url = redis.get("#{room}_media_url")

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
      banner_link = "https://openloft.org/buy_ad"
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

    if params.has_key?("public") && params[:public] == "true"
      redis.lrem "public_rooms", 0, params[:room].to_s
      redis.lpush "public_rooms", params[:room].to_s
      unless redis.hget "room_names", params[:room].to_s
        redis.hset "room_names", params[:room].to_s, params[:name].to_s
      end
    end

    render "canvas.ecr", layout: "gbaldraw.ecr"
  end

  def shorten_link
    redis = REDIS
    room_name = request.url.gsub("\/o\/", "").to_s
    room_id = redis.hgetall("room_names").key_for(room_name).to_s rescue ""
    if room_id == ""
      room_id = "#{Random.new.hex(5)}#{Random.new.hex(5)}"
    end
    random_number = Random.rand(2000000).to_i
    room = room_id rescue ""
    redis = REDIS

    media_url = redis.get("#{room}_media_url")

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
      banner_link = "https://openloft.org/buy_ad"
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
      amt_packets = redis.llen("chats_#{room}")
      if amt_packets >= 100
        chats = redis.lrange("chats_#{room}", -100, -1)
      else
        chats = redis.lrange("chats_#{room}", 0, -1)
      end
    end

    redis.lrem "public_rooms", 0, room.to_s
    redis.lpush "public_rooms", room.to_s
    unless redis.hget "room_names", room.to_s
      redis.hset "room_names", room.to_s, room_name
    end

    render "canvas.ecr", layout: "gbaldraw.ecr"
  end

  def random_ad
    redis = REDIS
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
      banner_link = "https://openloft.org/buy_ad"
    end
    
    {ad: Sanitizer.process(ad), banner_link: Sanitizer.process(banner_link)}.to_h.to_json
  end


  def stats
    room = params[:room] rescue nil
    redis = REDIS
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
    names.each { |n| points[n.to_s] = packets.reject {|pa| JSON.parse(pa.to_s)["name"] != n}.size.to_s rescue "" }
    layers = {} of String => String
    names.each { |n| layers[n.to_s] = packets.select {|pac| js = JSON.parse(pac.to_s); js["name"] == n && js.as_h.has_key?("dragging") && js["dragging"] == false}.size.to_s rescue "" }
    all_layers = 0
    layers.each do |layer|
      all_layers += layer[1].to_i rescue 0
    end
    names = names.sort { |a,b| points[b.to_s].to_i rescue 0 <=> points[a.to_s].to_i rescue 0}
    # all_time = {} of String => String
    # redis.hgetall("all_time").each_slice(2) { |drawer| all_time[drawer[0].to_s] = drawer[1].to_s rescue "" }
    # puts all_time
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
  
      redis = REDIS
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
      redis = REDIS
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
      {active_users: (Amber::WebSockets::ClientSockets.client_sockets.size / 6).to_f.round(0).to_i }.to_h.to_json
    end

    def upload_to_scalable_press

      redis = REDIS
  
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
        file_url = "https://openloft.org/#{save_name}"
      else
        response = HTTP::Client.get(file_url)
        save_name = "#{Random.rand(10000).to_i}.png"
        random_file = File.open("public/#{save_name}", "w") do |file|
            file << response.body
        end
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
            request.headers["Authorization"] = "Basic #{Base64.strict_encode("#{Amber.settings.secrets["SCALABLE_PRESS_TOKEN"]}")}"
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
        request.headers["Authorization"] = "Basic #{Base64.strict_encode("#{Amber.settings.secrets["SCALABLE_PRESS_TOKEN"]}")}"
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
        request.headers["Authorization"] = "Basic #{Base64.strict_encode("#{Amber.settings.secrets["SCALABLE_PRESS_TOKEN"]}")}"
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
              formdata.field("design[sides][front][artwork]", "https://openloft.org/#{design_id}.png")
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
            request.headers["Authorization"] = "Basic #{Base64.strict_encode("#{Amber.settings.secrets["SCALABLE_PRESS_TOKEN"]}")}"
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

      redis = REDIS

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
        request.headers["Authorization"] = "Basic #{Base64.strict_encode("#{Amber.settings.secrets["SCALABLE_PRESS_TOKEN"]}")}"
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
      redis = REDIS
      
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
  
      redis = REDIS
      redis.hset("completed_tshirt_orders", email, id)
  
      



      url = URI.parse("https://api.scalablepress.com/v2/order")

      client = HTTP::Client.new(url)
      body_string = "orderToken=#{order_token}"
      client.before_request do |request|
        request.headers["Authorization"] = "Basic #{Base64.strict_encode("#{Amber.settings.secrets["SCALABLE_PRESS_TOKEN"]}")}"
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
      redis = REDIS
      order_id = redis.hget("scalable_order_ids", transaction_id)

      url = URI.parse("https://api.scalablepress.com/v3/event?orderId=#{order_id}")

      client = HTTP::Client.new(url)
      client.before_request do |request|
        request.headers["Authorization"] = "Basic #{Base64.strict_encode("#{Amber.settings.secrets["SCALABLE_PRESS_TOKEN"]}")}"
      end
      
      response = client.get "/v3/event?orderId=#{order_id}"

      puts response.body

      receipts = JSON.parse(response.body).as_a

      render("receipt.ecr")
    end


    def change_theme
      session["theme"] = params["theme"].to_s
      {error: "success"}.to_json
    end

end
