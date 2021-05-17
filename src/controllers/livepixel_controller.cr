require "redis"
require "sanitize"
require "http"
require "uri"

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
end
