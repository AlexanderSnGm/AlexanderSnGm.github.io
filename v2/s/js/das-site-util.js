(function($) {
    if (typeof Das !== 'object')
        return;

    if ('SiteUtil' in Das)
        return;

    var _isMobileDevice = window._DasIsMobileDevice;
    var _isTabletDevice = window._DasIsTabletDevice;
    var _areCookiesEnabled = true; //window._DasAreCookiesEnabled;

    var _isInitiated = false;
    var $messageError = null;

    var MSGBOX_GENERAL_ERROR = 'Sorry, there is a connection issue, please try reloading the page';
    var MSGBOX_ERROR_FNAME_WEB_SWEEPSTAKES = 'Please enter your First Name';
    var MSGBOX_ERROR_LNAME_WEB_SWEEPSTAKES = 'Please enter your Last Name';
    var MSGBOX_ERROR_EMAIL_WEB_SWEEPSTAKES = 'Please enter a valid Email Address';
    var MSGBOX_ERROR_OFFIAL_RULES_WEB_REGISTER = 'Please confirm you have read and agree to the Official Rules';
    var MSGBOX_ERROR_AGE_WEB_SWEEPSTAKES = 'Sorry, you must have your parent or legal guardian assist you';
    var MSGBOX_ERROR_CITY_WEB_SWEEPSTAKES = 'Please enter a City';
    var MSGBOX_ERROR_STATE_WEB_SWEEPSTAKES = 'Please select your State';
    var MSGBOX_ERROR_ADDRESS_WEB_SWEEPSTAKES = 'Please enter your home address';
    var MSGBOX_ERROR_PHONE_WEB_SWEEPSTAKES = 'Please enter a valid 10 digit phone number';
    var MSGBOX_ERROR_ESSAY_WEB_SWEEPSTAKES = 'Please enter an Essay';
    var MSGBOX_ERROR_IMAGE_WEB_SWEEPSTAKES = "Please select an image";
    var MSGBOX_ERROR_PERMISSION_WEB_SWEEPSTAKES = 'Please confirm that you have permission to enter the contest';
    var MSGBOX_IMAGEERROR_UPLOAD = 'An error has ocurred, please try again';
    var MSGBOX_ERROR_ALREADY_INVALID_DOB = "Since you tried to enter with a birthdate under 18 years of age, you are not allowed to re-enter";


    var arrayPost = new Array();
    arrayPost['message_name'] = 'Please enter your name';
    arrayPost['message_email'] = MSGBOX_ERROR_EMAIL_WEB_SWEEPSTAKES;
    arrayPost['message_message'] = 'Please enter your message';
    arrayPost['success'] = 'Your message has been sent! We will contact you soon';
    arrayPost['contact_name'] = 'Please enter your name';
    arrayPost['contact_email'] = MSGBOX_ERROR_EMAIL_WEB_SWEEPSTAKES;
    arrayPost['contact_message'] = 'Please enter your message';


    arrayPost['GeneralError'] = MSGBOX_GENERAL_ERROR;


    arrayPost['Cookies'] = 'Please enable cookies and refresh your browser';
    arrayPost['session_expired'] = 'Sorry your session has expired, please reload your page';
    arrayPost['dob_sweepstakes'] = MSGBOX_GENERAL_ERROR;
    arrayPost['CaptchaFalse'] = 'The reCAPTCHA wasn\'t entered correctly. Go back and try it again.';


    var _animateScroll = function($messageError) {
        var $container = $('.form_box');
        if (_isMobileDevice)
            //$container = $('html,body');
            //$('html,body').animate({
            $container.animate({
                scrollTop: $messageError.offset().top - 100
            }, 800);
    };

    var _init = function() {
        $messageError = $('div.alert');
    };


    var _checkFormOnClick = function($form) {
        console.log('checkform');
        $(":input", $form).filter(':enabled,[type!="hidden"]').each(function() {
            var $element = $(this);
            if ($element.is('select.styled')) {
                $element.prev('span.select').removeClass("focused");
            } else if ($element.is('input[type="checkbox"].styled')) {
                $element.prev('span.checkbox').removeClass("focused");
            } else if ($element.is('input[type="radio"].styled')) {
                $element.parent().parent().siblings('label.age_alert').removeClass("focused");
            } else {
                $element.removeClass("focused");
            }
        });


        var ruleList = {
            //
        };


        var returnVarId;

        if (_areCookiesEnabled) {
            returnVarId = Das.FormUtils.validateFormFields($form, ruleList);
        } else {
            returnVarId = {'error': 'Cookies', '$field': $()};
        }

        //das.log('returnVarId: ', returnVarId);

        if (returnVarId === true) {
            return true;
        } else {
            Das.FormUtils.viewMessage($messageError, arrayPost[returnVarId.error], 1);

            var $element = returnVarId.$field;

            if ($element.is('select.styled')) {
                $element.prev('span.select').addClass("focused");
            } else if ($element.is('input[type="checkbox"].styled')) {
                $element.prev('span.checkbox').addClass("focused");
            } else if ($element.is('input[type="radio"].styled')) {
                $element.parent().parent().siblings('label.age_alert').addClass("focused");
            } else {
                $element.addClass("focused");
            }

            if (!(_isMobileDevice || _isTabletDevice))
                Das.FormUtils.goToError(returnVarId.$field);

            _animateScroll($messageError);
            return false;
        }
    };

    var _registerEndSave = function(request, callback, cbError) {

        var _obj = request;

        var _nopFn = function() {
        };
        if (typeof cbError != 'function') {
            cbError = _nopFn;
        }

        if (typeof callback != 'function') {
            callback = _nopFn;
        }

        if (!_obj || !('status' in _obj)) {
            Das.FormUtils.viewMessage($messageError, arrayPost['GeneralError'], 1);
            _animateScroll($messageError);

            cbError();
            return;
        }
        if (_obj.status == 404) {
            Das.FormUtils.viewMessage($messageError, arrayPost[_obj.error], 1);

//            if (_obj.error == "age_web_register" || _obj.error == "already_invalid_dob") {
//                $("div#bdpicker select").each(function() {
//                    $(this).attr("disabled", true);
//                });
//            }
            //das.log('_obj.error: ', _obj.error);
            if (_obj.error == "contact_name") {
                $("#tbl_contact_name").addClass("focused");
            }
            if (_obj.error == "contact_email") {
                $("#tbE_contact_email").addClass("focused");
            }
            if (_obj.error == "contact_message") {
                $("#tbl_contact_message").addClass("focused");
            }

            _animateScroll($messageError);

//            if ('recaptcha' in _obj && _obj['recaptcha'])
//                Recaptcha.reload();

            cbError();
            return;

        }
        if (_obj.status != 200) {
            //do something
        }

        callback.call();
    };

    Das.SiteUtil = {
        checkFormOnClick: function($form) {
            if (!_isInitiated)
                _init();
            return _checkFormOnClick($form);
        },
        registerEndSave: function(msg, callback, cbError) {
            if (!_isInitiated)
                _init();
            _registerEndSave(msg, callback, cbError);
        }
    };


})(jQuery);