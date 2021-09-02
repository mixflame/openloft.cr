# openloft.cr

[![Amber Framework](https://img.shields.io/badge/using-amber_framework-orange.svg)](https://amberframework.org)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RK689NEEMXCYE)

This is OpenLoft Collaborative Editor 1.0 with call reconnection, using Amber/Crystal 1.0.0. Originally written in Ruby on Rails with ActionCable and ported to Crystal for speed. Featuring: HTML Chat, WebRTC Video/Audio, Collaborative Canvas, Collaborative Text Editor.

Featuring discord and irc bridge bots.

## Getting Started

These instructions will get a copy of this project running on your machine for development and testing purposes.

Please see [deployment](https://docs.amberframework.org/amber/deployment) for notes on deploying the project in production.

## Prerequisites

This project requires [Crystal](https://crystal-lang.org/) ([installation guide](https://crystal-lang.org/docs/installation/)).

## Development

To start your Amber server:

1. Install dependencies with `shards install`
2. Build executables with `shards build`
3. Create and migrate your database with `bin/amber db create migrate`. Also see [creating the database](https://docs.amberframework.org/amber/guides/create-new-app#creating-the-database).
4. Start Amber server with `bin/amber watch`
5. Run redis-server

Now you can visit http://localhost:3000/ from your browser.

Getting an error message you need help decoding? Check the [Amber troubleshooting guide](https://docs.amberframework.org/amber/troubleshooting), post a [tagged message on Stack Overflow](https://stackoverflow.com/questions/tagged/amber-framework), or visit [Amber on Gitter](https://gitter.im/amberframework/amber).

Using Docker? Please check [Amber Docker guides](https://docs.amberframework.org/amber/guides/docker).

## Tests

To run the test suite:

```
crystal spec
```

## Contributing

1. Fork it ( https://github.com/mixflame/openloft.cr/fork )
2. Create your feature branch ( `git checkout -b my-new-feature` )
3. Commit your changes ( `git commit -am 'Add some feature'` )
4. Push to the branch ( `git push origin my-new-feature` )
5. Create a new Pull Request

## Contributors

- [mixflame](https://github.com/mixflame) Jonathan Silverman - creator, maintainer
