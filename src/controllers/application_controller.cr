require "jasper_helpers"

class ApplicationController < Amber::Controller::Base
  include JasperHelpers
  LAYOUT = "application.ecr"
  property locale : String = "en"

  before_action do
    all { @locale = HTTP::Server::Context.new(request, response).locale }
  end

end
