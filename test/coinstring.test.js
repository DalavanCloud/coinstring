var assert = require('assert')
var cs = require('../')
var fixtures = require('./fixtures/coinstring')

describe('coinstring', function() {
  var privateKeyHex = fixtures.valid[0].hex
  var privateKeyHexBuf = new Buffer(privateKeyHex, 'hex')
  var privateKeyHexCompressed = privateKeyHex + "01" //<--- compression involves appending 0x01 to end
  var privateKeyHexCompressedBuf = new Buffer(privateKeyHexCompressed, 'hex')
  var hash160 = "3c176e659bea0f29a3e9bf7880c112b1b31b4dc8" //hash representing uncompressed
  var hash160Buf = new Buffer(hash160, 'hex')
  var hash160c = "a1c2f92a9dacbd2991c3897724a93f338e44bdc1" //hash representing compressed
  var hash160cBuf = new Buffer(hash160c, 'hex')

  describe('> when all arguments are passed', function() {
    describe('> when Bitcoin', function() {
      var address = "16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS"
      var addressCompressed = '1FkKMsKNJqWSDvTvETqcCeHcUQQ64kSC6s'
      var wif = "5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD"
      var wifCompressed = 'KwomKti1X3tYJUUMb1TGSM2mrZk1wb1aHisUNHCQXTZq5auC2qc3'

      describe('> when public', function() {
        var version = 0x0 //bitcoin public / pubkeyhash

        it('coinstring should generate the public address', function() {
          assert.equal(cs.encode(version, hash160Buf), address)
          assert.equal(cs.encode(version, hash160cBuf), addressCompressed)          
        })

        it('validate should validate the address', function() {
          assert(cs.validate(version, address))
          assert(cs.validate(version, addressCompressed))  
        })

        it('decode should parse the address and return the hash160', function() {
          assert.equal(cs.decode(version, address).bytes.toString('hex'), hash160)
          assert.equal(cs.decode(version, addressCompressed).bytes.toString('hex'), hash160c)   
        })
      })

      describe('> when private', function() {
        var version = 0x80 //bitcoin private key

        describe('> when input is an array to coinstring', function() {
          it('should generate the WIF', function() {
            var arr = [].slice.call(new Buffer(privateKeyHex, 'hex'))
            assert(Array.isArray(arr))
            assert.equal(cs.encode(version, arr), wif)
          })
        })

        describe('> when input is an Uint8Array to coinstring', function() {
          it('should generate the WIF', function() {
            var arr = [].slice.call(new Buffer(privateKeyHex, 'hex'))
            arr = new Uint8Array(arr)
            assert(arr instanceof Uint8Array)
            assert.equal(cs.encode(version, arr), wif)
          })
        })

        it('coinstring should generate the WIF', function() {
          assert.equal(cs.encode(version, privateKeyHexBuf), wif)
          assert.equal(cs.encode(version, privateKeyHexCompressedBuf), wifCompressed)
        })

        it('validate should validate the address', function() {
          assert(cs.validate(version, wif))
          assert(cs.validate(version, wifCompressed))  
        })

        it('decode should parse the address and return the hash160', function() {
          assert.equal(cs.decode(version, wif).bytes.toString('hex'), privateKeyHex)
          assert.equal(cs.decode(version, wifCompressed).bytes.toString('hex'), privateKeyHexCompressed)   
        })
      })
    })

    describe('> when Dogecoin', function() {
      var address = "DAcq9oJpZZAjr56RmF7Y5zmWboZWQ4HAsW"
      var addressCompressed = 'DKtQu8G1cFQikveWy3qAkQTDMY8PKVU18Z'
      var wif = "6JGLNEiEYR6pFGq84gwceHWYLcyKaLWzaymVajjCPPUEGAR2MTT"
      var wifCompressed = 'QPCgUjWzmfNfXzsQBHJ4KZsPKbmaz99PAyZP9ubFFpBBXWuSQh6n'

      describe('> when public', function() {
        var version = 0x1E //dogecoin public / pubkeyhash

        it('coinstring should generate the public address', function() {
          assert.equal(cs.encode(version, hash160Buf), address)
          assert.equal(cs.encode(version, hash160cBuf), addressCompressed)          
        })

        it('validate should validate the address', function() {
          assert(cs.validate(version, address))
          assert(cs.validate(version, addressCompressed))  
        })

        it('decode should parse the address and return the hash160', function() {
          assert.equal(cs.decode(version, address).bytes.toString('hex'), hash160)
          assert.equal(cs.decode(version, addressCompressed).bytes.toString('hex'), hash160c)   
        })
      })

      describe('> when private', function() {
        var version = 0x1E + 0x80 //dogecoin private key

        it('coinstring should generate the WIF', function() {
          assert.equal(cs.encode(version, privateKeyHexBuf), wif)
          assert.equal(cs.encode(version, privateKeyHexCompressedBuf), wifCompressed)
        })

        it('validate should validate the address', function() {
          assert(cs.validate(version, wif))
          assert(cs.validate(version, wifCompressed))  
        })

        it('decode should parse the address and return the hash160', function() {
          assert.equal(cs.decode(version, wif).bytes.toString('hex'), privateKeyHex)
          assert.equal(cs.decode(version, wifCompressed).bytes.toString('hex'), privateKeyHexCompressed)   
        })
      })
    })
  })

  describe('> when input is invalid', function() {
    it('validate should return false', function() {
      var address = "16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS"
      var wif = "5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD"

      assert(!cs.validate(0x0, address.toLowerCase()))
      assert(!cs.validate(0x80, wif.toLowerCase()))
    })
  
    it('decode should throw an exception', function() {
      var address = "16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS"
      var wif = "5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD"

      assert.throws(function() { cs.decode(0x0, address.toLowerCase()) })
      assert.throws(function() { cs.decode(0x80, wif.toLowerCase()) })
      assert.throws(function() { cs.decode(0x1, address) })
      assert.throws(function() { cs.decode(0x2, wif) })
    })
  })

  describe('> when version is specified', function() {
    it('coinstring should partially be applied', function() {
      var btcWif = "5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD"
      var toBtcWif = cs.encode(0x80)
      assert.equal(toBtcWif(privateKeyHexBuf), btcWif)
    })

    it('decode should partially be applied', function() {
      var btcWif = "5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD"
      var fromBtcWif = cs.decode(0x80)
      assert.equal(fromBtcWif(btcWif).bytes.toString('hex'), privateKeyHex)
    })

    it('validate should partially be applied', function() {
      var address = "16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS"
      var btcAddressValidator = cs.validate(0x0)
      assert(btcAddressValidator(address))
      assert(!btcAddressValidator(address.toUpperCase()))
    })
  })

  describe('- decode()', function() {
    describe('> when version isnt passed', function() {
      it('should still work', function() {
        var wifCompressed = 'KwomKti1X3tYJUUMb1TGSM2mrZk1wb1aHisUNHCQXTZq5auC2qc3'
        var res = cs.decode(wifCompressed)
        assert.equal(res.bytes.toString('hex'), privateKeyHexCompressed)
        assert.equal(res.version, 0x80)
      })
    })
  })
})


