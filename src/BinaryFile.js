var XHR = (function ()
{
    function createRequest ()
    {
        var requestConstructors = [
            function () { return new ActiveXObject("Microsoft.XMLHTTP"); },
            function () { return new XMLHttpRequest(); }
        ];

        for (var i = 0; i < requestConstructors.length; ++i) {
            try {
                return requestConstructors[i]();
            }
            catch (ex) {
                // noop
            }
        }

        throw new Error("Unable to create request object.");
    }

    function sendRequest (options)
    {
        if ("undefined" == typeof(options.async)) {
            options.async = false;
        }

        var request = createRequest();

        var requestCallback = function (responseData)
        {
            if (request.status == "200" || request.status == "206" || request.status == "0") {
                options.success({
                    data   : responseData,
                    status : request.status,
                    length : request.getResponseHeader("Content-Length")
                });
            }
            else {
                if (options.error) { options.error(); }
            }
        };

        if (typeof(request.onload) != "undefined") {
            request.onload = function () { requestCallback(request.responseText); };
        }
        else {
            request.onreadystatechange = function ()
            {
                if (request.readyState == 4) { requestCallback(request.responseBody); }
            };
        }

        request.open("GET", options.url, options.async);

        if (request.overrideMimeType) {
            request.overrideMimeType("text/plain; charset=x-user-defined");
        }

        request.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 1970 00:00:00 GMT");
        request.send(null);
    }

    return sendRequest;
}());

var BinaryFile = (function ()
{
    // Initializes some IE-specific functions.
    (function ()
    {
        document.write(
            "<script type='text/vbscript'>\r\n"
            + "Function IEBinary_getByteAt(strBinary, iOffset)\r\n"
            + " IEBinary_getByteAt = AscB(MidB(strBinary,iOffset+1,1))\r\n"
            + "End Function\r\n"
            + "Function IEBinary_getLength(strBinary)\r\n"
            + " IEBinary_getLength = LenB(strBinary)\r\n"
            + "End Function\r\n"
            + "</script>\r\n"
        );
    })();
    
    // TODO: Change the argument list to allow for an options object
    var BinaryFile = function (data, options)
    {
        var options = options || {};
        
        this.data   = data;
        this.offset = 0;
        
        this.start     = options.start     || 0;
        this.length    = options.length    || 0;
        this.bigEndian = options.bigEndian || false;
        
        if ("string" == typeof this.data) {
            this.length = length || this.data.length;
        }
        else if ("unknown" == typeof this.data) {
            this.length = length || IEBinary_getLength(this.data);
            
            this.prototype.getByte = function ()
            {
                return IEBinary_getByteAt(this.data, this.offset + this.start);
            };
        }
    };
    
    BinaryFile.fromBase64 = function (data, start, length)
    {
        return new BinaryFile(window.atob(data), start, length);
    };
    
    BinaryFile.prototype.getData = function ()
    {
        return this.data;
    };
    
    BinaryFile.prototype.toBase64 = function ()
    {
        return window.btoa(this.data);
    };
    
    BinaryFile.prototype.getLength = function ()
    {
        return this.length;
    };
    
    BinaryFile.prototype.seek = function (offset)
    {
        this.offset = offset;
    };
    
    BinaryFile.prototype.getByte = function ()
    {
        return this.data.charCodeAt(this.start + this.offset++) & 0xFF;
    };
    
    BinaryFile.prototype.getByteArray = function (length)
    {
        for (var bytes = [], i = 0; i < length; bytes.push(this.getByte()), ++i)
            ;;
        
        return bytes;
    };
    
    BinaryFile.prototype.read = function (length)
    {
        var data = this.data.substr(this.offset, length);
        
        this.offset += length;
        
        return data;
    };
    
    BinaryFile.prototype.getSByte = function ()
    {
        var iByte = this.getByte();
        
        return iByte > 127 ? (iByte - 256) : iByte;
    };
    
    BinaryFile.prototype.getShort = function () 
    {
        for (var bytes = [], i = 0; i < 2; bytes.push( this.getByte() ), ++i)
            ;;
        
        var iShort
            = this.bigEndian
            ? (bytes[0] << 8) + bytes[1]
            : (bytes[1] << 8) + bytes[0]
            ;
        
        return iShort < 0 ? (iShort + 65535) : iShort;
    };
    
    BinaryFile.prototype.getSShort = function ()
    {
        var iUShort = this.getShort();
        
        return iUShort > 32767 ? (iUShort - 65536) : iUShort;
    };
    
    // TODO: There's probably a clearer way to do this.
    BinaryFile.prototype.getLong = function ()
    {
        for (var bytes = [], i = 0; i < 4; bytes.push( this.getByte() ), ++i)
            ;;
        
        var iLong
            = this.bigEndian
            ? (((((bytes[0] << 8) + bytes[1]) << 8) + bytes[2]) << 8) + bytes[3]
            : (((((bytes[3] << 8) + bytes[2]) << 8) + bytes[1]) << 8) + bytes[0]
            ;
        
        return iLong < 0 ? (iLong + 4294967296) : iLong;
    };
    
    BinaryFile.prototype.getSLong = function ()
    {
        var iULong = this.getLong();
    
        return iULong > 2147483647 ? (iULong - 4294967296) : iULong;
    };
    
    BinaryFile.prototype.getString = function (length)
    {
        var str = "";
        
        for (var i = 0; i < length; ++i) {
            var nextByte = this.getByte();
            str += "%" + (nextByte <= 0xf ? "0" : "") + nextByte.toString(16);
        }
        
        return decodeURIComponent(str);
    };
    
    BinaryFile.prototype.getChar = function ()
    {
        return String.fromCharCode(this.getByte());
    };
    
    return BinaryFile;
})();
