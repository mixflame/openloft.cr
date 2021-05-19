require "redis"
require "sanitize"
require "http"
require "uri"
require "base64"

class LivepixelController < ApplicationController


  def gallery
    redis = Redis.new

    image_ids = redis.lrange("gallery", 0, -1)

    render("gallery.ecr")
  end


  # imgur client id 3e035ba859d6add
  def upload_to_imgur

    redis = Redis.new

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
    redis = Redis.new
    redis.del("packets_#{room}")
    CanvasSocket.broadcast("message", "canvas:#{room}", "message_new", {clear: true}.to_h)
  end

  def canvas
    sanitizer = Sanitize::Policy::HTMLSanitizer.common
    random_number = Random.rand(10000).to_i
    room = params[:room] rescue ""
    redis = Redis.new
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

    render "canvas.ecr"
  end


  def stats
    redis = Redis.new
    amt_packets = redis.llen("packets")
    if amt_packets >= 50000
      packets = redis.lrange("packets", -50000, -1)
    else
      packets = redis.lrange("packets", 0, -1)
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
    headers = HTTP::Headers{"Prefer" => "return=representation", "Content-Type" => "application/json", "Authorization" => "Basic #{Base64.strict_encode("Aa2go6c2he4XPU-vrwTzb3X2F4AHsZYRX9MsRR-alLzWxxM0V_RiV0vbfQT3LdIZiphgkkqRhQ8HSmU-:EHI6j2vssDeg_ww8DLQ_MNBnDXG_ia-QUH9M_fsv4WSNLEVywuZ6vFyKCocFifaToO2wdjwzcNvLSBqu")}"}
    response = HTTP::Client.post("https://api.sandbox.paypal.com/v2/checkout/orders", headers, body)
    
    puts response.body

    response.body.to_json

    end

    def capture_order
      debug = true
      order_id = params["orderID"]
      headers = HTTP::Headers{"Prefer" => "return=representation", "Content-Type" => "application/json", "Authorization" => "Basic #{Base64.strict_encode("Aa2go6c2he4XPU-vrwTzb3X2F4AHsZYRX9MsRR-alLzWxxM0V_RiV0vbfQT3LdIZiphgkkqRhQ8HSmU-:EHI6j2vssDeg_ww8DLQ_MNBnDXG_ia-QUH9M_fsv4WSNLEVywuZ6vFyKCocFifaToO2wdjwzcNvLSBqu")}"}
      response = HTTP::Client.post("https://api.sandbox.paypal.com/v2/checkout/orders/#{order_id}/capture", headers)
      
      json = JSON.parse(response.body)
      id = json["id"]

      email = json["payer"]["email_address"]
  
      redis = Redis.new
      redis.hset("completed_orders", email, id)
  
      response.body.to_json
      end

end
