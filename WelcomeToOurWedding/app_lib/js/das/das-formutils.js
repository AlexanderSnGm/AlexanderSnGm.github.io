(function ($){
    if(typeof Das !== 'object')
        return;

    if('FormUtils' in Das)
        return;


    if(typeof String.prototype.trim !== 'function') {
	  	String.prototype.trim = function() {
	    	return this.replace(/^\s+|\s+$/g, ''); 
	  	}
	}
    
    var _validationFunctions = {
        'isNotEmpty' : function(value) {
            value = $.trim(value);
            return (value.length > 0);
        },
        'isNumeric' : function(num) {
            return /^\d+$/.test(num);
        },
        'isAlphaNumeric': function(string) {
            return /^[\w\d ]+$/.test(string);
        },
        'isEmail' : function(email){
            return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(email);
        },
        'areEmails': function(emails) {
        	var separator = ",";
        	var arrayEmails = emails.split(separator);
        	
        	for (i=0;i<arrayEmails.length;i++){
        		var email = arrayEmails[i].trim();
        		
        		if(_validationFunctions.isNotEmpty(email)){
	        		if(!_validationFunctions.isEmail(email)){
	        			return false;
	        		}
	        	}else if(i==0){
	        		return false;
	        	}
        	}
        	return true;
        },
        'isZipCode' : function(zipcode){
            return /^(\d{5})(-\d{4})?$/.test(zipcode);            
        },
        'isPhone' : function(phone) {
        	value = $.trim(phone);
            //return (value.length > 0);
            return /^(([\(]?\d{3}[\)]?(((([-\.])|([\ ]+))\d{3}(([-\.])|([\ ]+))((\d{4})|(\d{2}(([-\.])|([\ ]+))\d{2})))|(\d{7})))|(\d{10}))$/.test(phone);
        },
        'isImageFile' : function (file){
            return /.+\.(jpe?g|gif|png)$/i.test(file);
        },
        'isVideoFile' : function (file){
            return /.+\.(mpe?g|avi|wmv|mp4|mov)$/i.test(file);
        }
    };    

    var _validateFormField = function(ruleList){
        var $element = $(this);
        var id = $element.attr("id");
        var name =$element.attr("name");
        var value = $element.val();

		if ((!Modernizr.input.placeholder) && 
            $element.is('[placeholder]') && 
            $element.val() == $element.attr('placeholder'))  {
            value = '';
        }

        var result = {
            $field:$element,
            'error':name
        };

        if (/^tbl_/.test(id)){
            if(!_validationFunctions.isNotEmpty(value))
                return result;
        }else if(/^tbN_/.test(id)){
            if(!_validationFunctions.isNumeric(value))
                return result;
        }else if(/^tbP_/.test(id)){
            if(!_validationFunctions.isPhone(value))
                return result;
        }else if(/^tbE_/.test(id)){
            if(!_validationFunctions.isEmail(value))
                return result;
        } else if (/^tbES_/.test(id)) {
            if (!_validationFunctions.areEmails(value))
                return result;
        }else if(/^tbZ_/.test(id)){
            if(!_validationFunctions.isZipCode(value))
                return result;
        }else if(/^tbI_/.test(id)){
            if(!_validationFunctions.isImageFile(value))
                return result;
        }else if(/^tbV_/.test(id)){
            if(!_validationFunctions.isVideoFile(value))
                return result;
        }else if(/^tbxN_/.test(id)){
            if(_validationFunctions.isNotEmpty(value))
                if(!_validationFunctions.isNumeric(value))
                    return result;
        }else if(/^tbxP_/.test(id)){
            if(_validationFunctions.isNotEmpty(value))
                if(!_validationFunctions.isPhone(value))
                    return result;
        }else if(/^tbxE_/.test(id)){
            if(_validationFunctions.isNotEmpty(value))
                if(!_validationFunctions.isEmail(value))
                    return result;
        }else if(/^tbxI_/.test(id)){
            if(_validationFunctions.isNotEmpty(value))
                if(!_validationFunctions.isImageFile(value))
                    return result;
        }else if(/^tbxV_/.test(id)){
            if(_validationFunctions.isNotEmpty(value))
                if(!_validationFunctions.isVideoFile(value))
                    return result;
        }else if(/^tbeE_/.test(id)){
            var arrayEmails = value.split(",");
            for(i=0;i<arrayEmails.length;i++){
                var email = Das.FormUtils.trimAll(arrayEmails[i]);
                if(!_validationFunctions.isEmail(email))
                    return result;
            }
        }
        
        if( id in ruleList ) {
            var returnString = ruleList[id].call(this,value);
            if( returnString === true) {
                return true;
            } else if(returnString === false ) {
                result.error = name;
            } else {
                result.error = returnString;
            }
            return result;
        }

        return true;
    };

    Das.FormUtils = {
        "goToError" : function ($field) {
            $($field).focus();
        },
        "viewMessage" : function (divMessage,strMessage,viewText){//Muestra el mensaje de Error    
            if(viewText==1){
                $(divMessage).html(strMessage).show();
            }else{
                $(divMessage).hide().html('');
            }
        },
        "viewMessageVisibility" : function(divMessage,strMessage,viewText){//Muestra el mensaje de Error visibility
            if(viewText==1){
                $(divMessage).html(strMessage).css('visibility','visible');
            }else{
                $(divMessage).css('visibility','hidden').html('');
            }
        },
        "clearInputText" : function(objForm){
            $('input[type="text"]:enabled', objForm).each( function (){
                $element = $(this);
                $element.val($.trim($element.val()));
            });
        },
        "validate" : _validationFunctions,
        "validateFormFields" : function (obj, ruleList){
            var returnString = true;

            $(":input", obj).filter(':enabled,[type="hidden"]').each( function (i){
                var $element = $(this);
                returnString = _validateFormField.call($element,ruleList);
                if(returnString !== true)
                    return false;
            });

            return returnString;
        },
        "validateFormFieldsWithTabIndex" : function (obj, ruleList){
            var returnString = true;
            var $element;
            var length = 0;
            var list = {};

            $(":input", obj).filter(':enabled, [type="hidden"]').each( function (i){
                if($(this).is("[tabindex]")) {
                    var tabIndex = ""+$(this).attr("tabindex");
                    list[tabIndex] = $(this);
                    length++;
                }
            });

            for(var i=1;i<=length;i++){
                var tabIndex = ""+i;
                if(!(tabIndex in list))
                    continue;
                $element = list[tabIndex];
                returnString = _validateFormField.call($element,ruleList);
                if(returnString !== true)
                    break;
            }
            return returnString;
        }, 
        "validateUrl" : function(url){
            return /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(([0-9]{1,5})?\/.*)?$/.test(url);
            
        },
        "trimAll" : function(string){
            if(string != ""){
                var strTrim = string;
                var re = /\s/g;
                if(string.search(re) != -1){
                    strTrim = string.replace(re,"");
                }
                return strTrim;
            }            
        }
    };
   
    
})(window.Das.$);
