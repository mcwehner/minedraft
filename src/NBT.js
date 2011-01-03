var TAG = (function ()
{
    var TAG_TYPES = [
        "End",          // 0x00
        "Byte",         // 0x01
        "Short",        // 0x02
        "Int",          // 0x03
        "Long",         // 0x04
        "Float",        // 0x05
        "Double",       // 0x06
        "Byte_Array",   // 0x07
        "String",       // 0x08
        "List",         // 0x09
        "Compound"      // 0x0a
    ];
    
    var TAG = function (name)
    {
        this.type = 0x00;
        this.name = name || "";
    };
    
    TAG.parse = function (data, tagType)
    {
        var tagType = tagType || data.getByte();
        var tag     = TAG[ TAG_TYPES[tagType] ].parse(data);
        
        tag.type = tagType;
        
        return tag;
    };
    
    TAG.parseNamed = function (data, tagType)
    {
        var tagType = tagType || data.getByte();
        var tagName = TAG.String.parse(data).value;
        var tag     = TAG[ TAG_TYPES[tagType] ].parse(data);
        
        tag.type = tagType;
        tag.name = tagName;
        
        return tag;
    };
    
    TAG.prototype.toString = function ()
    {
        return "(TAG_" + TAG_TYPES[this.type] + ") " + this.name;
    };
    
    TAG.prototype.valueOf = function ()
    {
        return this.value;
    };
    
    TAG.prototype.prettyPrint = function (indentLevel)
    {
        indentLevel = indentLevel || 0;
        
        for (var indent = "", i = 0; i < indentLevel; indent += "    ", ++i)
            ;;
            
        var strArray = [indent + this.toString() + (this.value ? ": " + this.value : "")];
        
        if (this.tags) {
            for (var i = 0; i < this.tags.length; ++i) {
                strArray.push(this.tags[i].prettyPrint(indentLevel + 1));
            }
        }
        
        return strArray.join("\n");
    };
    
    return TAG;
})();

TAG.End = (function ()
{
    var TAG_End = function () { TAG.call(this); };
    
    TAG_End.prototype = new TAG();
    
    TAG_End.parse = function (data)
    {
        return new TAG.End();
    };
    
    return TAG_End;
})();

TAG.Byte = (function ()
{
    var TAG_Byte = function (value)
    {
        TAG.call(this);
        
        this.type  = 0x01;
        this.value = value;
    };
    
    TAG_Byte.prototype = new TAG();
    
    TAG_Byte.parse = function (data)
    {
        return new TAG.Byte(data.getByte());
    };
    
    return TAG_Byte;
})();

TAG.Short = (function ()
{
    var TAG_Short = function (value)
    {
        TAG.call(this);
        
        this.type  = 0x02;
        this.value = value;
    };
    
    TAG_Short.prototype = new TAG();
    
    TAG_Short.parse = function (data)
    {
        return new TAG.Short(data.getSShort());
    };
    
    return TAG_Short;
})();

TAG.Int = (function ()
{
    var TAG_Int = function (value)
    {
        TAG.call(this);
        
        this.type  = 0x03;
        this.value = value;
    };
    
    TAG_Int.prototype = new TAG();
    
    TAG_Int.parse = function (data)
    {
        return new TAG.Int(data.getSLong());
    };
    
    return TAG_Int;
})();

TAG.Long = (function ()
{
    var TAG_Long = function (value)
    {
        TAG.call(this);
        
        this.type  = 0x04;
        this.value = value;
    };
    
    TAG_Long.prototype = new TAG();
    
    TAG_Long.parse = function (data)
    {
        // FIXME: We have a problem: Notch's long is 64 bits, and javascript
        // doesn't like 64-bit numbers...
        
        // TODO: Implement `TAG_Long()'. Right now, this is just consuming
        // the right width of data, but returning nothing.
        return new TAG.Long(data.getString(8));
    };
    
    return TAG_Long;
})();

TAG.Float = (function ()
{
    var TAG_Float = function (value)
    {
        TAG.call(this);
        
        this.type  = 0x05;
        this.value = value;
    };
    
    TAG_Float.prototype = new TAG();
    
    TAG_Float.parse = function (data)
    {
        // FIXME: I'm pretty sure this is wrong. It's the right width, but
        // `TAG_Float' is defined as: "32 bits, big endian, IEEE 754-2008,
        // binary32"
        return new TAG.Float(data.getLong());
    };
    
    return TAG_Float;
})();

TAG.Double = (function ()
{
    var TAG_Double = function (value)
    {
        TAG.call(this);
        
        this.type  = 0x06;
        this.value = value;
    };
    
    TAG_Double.prototype = new TAG();
    
    TAG_Double.parse = function (data)
    {
        // FIXME: We have a problem: Notch's double is 64 bits, and javascript
        // doesn't like 64-bit numbers...
        
        // TODO: Implement `TAG_Double()'. Right now, this is just consuming
        // the right width of data, but returning nothing.
        return new TAG.Double(data.getString(8));
    };
    
    return TAG_Double;
})();

TAG.Byte_Array = (function ()
{
    var TAG_Byte_Array = function (bytes)
    {
        TAG.call(this);
        
        this.type  = 0x07;
        this.bytes = bytes;
    };
    
    TAG_Byte_Array.prototype = new TAG();
    
    TAG_Byte_Array.parse = function (data)
    {
        return new TAG.Byte_Array(
            data.getByteArray( TAG.Int.parse(data).value )
        );
    };
    
    return TAG_Byte_Array;
})();

TAG.String = (function ()
{
    var TAG_String = function (value)
    {
        TAG.call(this);
        
        this.type  = 0x08;
        this.value = value;
    };
    
    TAG_String.prototype = new TAG();
    
    TAG_String.parse = function (data)
    {
        return new TAG.String(
            data.getString( TAG.Short.parse(data).value )
        );
    };
    
    return TAG_String;
})();

TAG.List = (function ()
{
    var TAG_List = function (tagId, tags)
    {
        TAG.call(this);
        
        this.type  = 0x09;
        this.tagId = tagId;
        this.tags  = tags;
    };
    
    TAG_List.prototype = new TAG();
    
    TAG_List.parse = function (data)
    {
        var tagId   = TAG.Byte.parse(data).value;
        var length  = TAG.Int.parse(data).value;
        var tags    = [];
        
        for (var i = 0; i < length; ++i) {
            tags.push( TAG.parse(data, tagId) );
        }
        
        return new TAG.List(tagId, tags);
    };
    
    return TAG_List;
})();

TAG.Compound = (function ()
{
    var TAG_Compound = function (tags)
    {
        TAG.call(this, name);
        
        this.type   = 0x0a;
        this.tags   = tags || [];
        this.tagMap = {};
        
        for (var i = 0; i < this.tags.length; ++i) {
            this.tagMap[this.tags[i].name] = this.tags[i];
        }
    };
    
    TAG_Compound.prototype = new TAG();

    TAG_Compound.parse = function (data)
    {
        //var name = TAG.String.parse(data).value;
        var tags = [];
        
        var tagType;
        
        while ( (tagType = data.getByte()) ) {
            tags.push( TAG.parseNamed(data, tagType) );
        }
        
        return new TAG.Compound(tags);
    };
    
    TAG_Compound.prototype.tagList = function ()
    {
        var tagList = [];
        
        for (var i = 0; i < this.tags.length; ++i) {
            tagList.push(this.tags[i].name);
        }
        
        return tagList;
    };
    
    TAG_Compound.prototype.hasTag = function (name)
    {
        return (name in this.tagMap);
    };
    
    TAG_Compound.prototype.getTag = function (name)
    {
        return this.tagMap[name];
    };
    
    return TAG_Compound;
})();
