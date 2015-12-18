# convert

Converts a collection of wikitext, templates and function calls to a combined wikitext document
See the example object for the objCollection object structure

**Parameters**

-   `collection` **array** 

**Examples**

```javascript
let example = [
'==Pure Wikitext==',
{
    template: 'Person',
    params: {
       email: 'rosalind.chan@optique.biz',
       phone: '+1 (864) 421-2744'
    }
},
{
    function: '#set',
    params: {
        let1: 1,
        let2: 'zwei'
    }
}];
```

Returns **string** 

# escape

Escapes problematic wikitext characters

**Parameters**

-   `wikitext` **string** 

Returns **string** 

# function

Converts an object to a MediaWiki parser function call

**Parameters**

-   `name` **string** name of the function
-   `params` **object** 
-   `mainParam`  
-   `lineBreak`  

Returns **string** wikitext

# settings

Default settings

# sparqlRowToTemplate

This converts a SPARQL JSON Result row (response.results.bindings) to a template

**Parameters**

-   `templateName`  
-   `row`  
-   `nameMap`  

Returns **string** 

# template

Converts an object to a wikitext template

**Parameters**

-   `name` **string** name of the template
-   `params` **object** 
-   `lineBreak`  

Returns **string** wikitext
