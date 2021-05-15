require "redis"

class LivepixelController < ApplicationController

    def canvas
        random_number = Random.rand(10000).to_i
        render "canvas.ecr", layout: "livepixel.ecr"
    end
end
