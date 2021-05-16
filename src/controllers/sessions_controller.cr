class SessionsController < ApplicationController


    def create
        hash = {} of String => String
        hash["type"] = params[:type] rescue nil
        hash["from"] = params[:from] rescue nil
        hash["to"] = params[:to] rescue nil
        hash["sdp"] = params[:sdp] rescue nil
        hash["candidate"] = params[:candidate] rescue nil
        hash["name"] = params[:name] rescue nil
        hash["room"] = params[:room] rescue nil
        hash["polite"] = params[:polite] rescue nil
        
        SessionSocket.broadcast("message", "session:#{params[:room]}", "message_new", hash)
        ""
      end

end
