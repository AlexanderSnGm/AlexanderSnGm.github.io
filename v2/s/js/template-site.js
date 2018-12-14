/**
 * Created with JetBrains PhpStorm.
 * User: devbftrust
 * Date: 10/24/13
 * Time: 9:11 PM
 * To change this template use File | Settings | File Templates.
 */
(function($) {


    /************************************Detectizr init****************************************/
    Modernizr.Detectizr.detect({
        'detectDevice': true,
        'detectDeviceModel': false,
        'detectScreen': true,
        'detectOS': false,
        'detectBrowser': false,
        'detectPlugins': false
    });

    Das.gaTrackPage = window._DasGATrackPage || function(track) {
        Das.log('tracking: ' + track);
    };

    Das.gaTrackEvent = window._DasGATrackEvent || function(eventData) {
        Das.log(['_trackEvent'].concat(eventData));
    }

    var deviceType = Modernizr.Detectizr.device.type;
    var screenWidth = $(window).width(),
            screenSizeMobile = 768;
    var
            band = false,
            _isUploading = false,
            _isLoading = false,
            _nextPage = true,
            _offset = 5,
            _limit = 5;


    var
            $mainContainer = $(),
            $menuContainer = $('.main_navigation'),
            $menuLinks = $('#menu_links a', $menuContainer),
            $mensajes = $(),
            $messagesBox = $(),
            $album = $();


    var
            animatingScroll = false,
            preLoadImg = (function() {
        var loaded = [];

        var lI = function(src, data) {
            var img = new Image(),
                    defer = $.Deferred(),
                    res = {
                error: false,
                src: src,
                img: img,
                data: data
            };

            if (_.findIndex(loaded, src) != -1) {
                defer.resolve(res);
                return defer.promise();
            }

            $(img).on('load', function(e) {
                $(this).off();
                loaded.push(src);
                res.width = img.width;
                res.height = img.height;
                defer.resolve(res);
            }).on('error', function() {
                $(this).off();
                res.error = true;
                defer.resolve(res);
            });
            img.src = src;

            return defer.promise();
        };

        return function(src, data) {
            if (typeof src == 'string')
                return lI(src, data);

            if (!$.isArray(src))
                return $.Deferred().reject().promise();

            var lD = [];
            for (var i = 0; i < src.length; i++) {
                if (typeof src[i] == 'string')
                    lD.push(lI(src[i]));
                else if (src[i]['src'] && typeof src[i]['src'] == 'string')
                    lD.push(lI(src[i]['src'], src[i]['data']));
            }

            return $.when.apply(null, lD);
        };
    })();

    var Tracking = (function() {
        var
                self = {},
                nofn = function() {
        },
                firstTime = true,
                // GA
                ga = (_.has(window, '_gaq') && (typeof _gaq != "undefined")) ?
                function(href, page) {
                    //console.log('page: ', page);
                    Das.gaTrackPage(page);
                    //_gaq.push(['_trackPageview', page]);
                } : nofn;

        self.pageView = function() {
            var page = location.pathname, href = location.href;

            if (location.hash == "" || location.hash == "#") {
                page += "#!/";
                href += page;
            } else
                page += location.hash;


            ga(href, page);
            firstTime = false;
        }

        return self;

    })();

    var History = (function() {
        var
                self = {},
                onEvent = false,
                blockEvent = false,
                state = '',
                states = [],
                callbacks = [];


        self.on = function(state, cb) {
            var cbs, i = _.indexOf(states, state);

            if (i == -1) {
                cbs = $.Callbacks("unique stopOnFalse");
                states.push(state);
                callbacks.push(cbs);

            } else {
                cbs = callbacks[i];
            }

            cbs.add(cb);
        };

        self.off = function(state, cb) {
            var i = _.indexOf(states, state);
            if (i >= 0) {
                var cbs = callbacks[i];
                if (typeof cb == "function") {
                    cbs.remove(cb);
                } else if (typeof cb == "undefined") {
                    callbacks[i] = $.Callbacks("unique stopOnFalse");
                }
            }
        };

        self.go = function(s) {
            if (s == state)
                return;

            if (onEvent)
                return;

            $.History.go(s);
        }

        self.change = function(s) {
            if (s == state)
                return;

            if (onEvent)
                return;

            blockEvent = true;
            $.History.go(s);
        }

        var callState = function(s) {

            if (s == state)
                return;

            if (onEvent)
                return;

            onEvent = true;

            if (blockEvent) {
                blockEvent = false;
            } else {
                var i = _.indexOf(states, s);
                if (i >= 0) {
                    var cbs = callbacks[i];
                    cbs.fire(s);
                }
            }

            state = s;
            onEvent = false;

            Tracking.pageView();
        };


        self.init = function() {
            var
                    has = false,
                    regExp = /^\#([^\#]+)$/,
                    mResArray = window.location.hash.match(regExp);

            if (window.location.hash == "" || window.location.hash == "#") {
                callState('#!/');
            } else if (mResArray) {
                callState(mResArray[1]);
            }

            $.History.bind(function(s) {
                callState(s);
            });

        };

        return self;

    })();

    pageImgPreloader = function() {
        var l = [];
        $('div#preload-div > div[data-img-src]').each(function() {
            var $this = $(this), src = $this.attr('data-img-src');
            l.push(src);
        });

        return preLoadImg(l);
    };



    /**************************************** menu ****************************************/

    menuScroll = function(scroll) {

        var $toAnim, offset;

        if (deviceType == "mobile") {
            $toAnim = $("html:not(:animated),body:not(:animated)")
            offset = 69;
        } else {
            $toAnim = $("#wrapper:not(:animated)");
            offset = 0;
        }


        var onScrollTo = false;

        $toAnim.animate({
            scrollTop: scroll + offset
        }, 800, function() {
            if (onScrollTo)
                return;
            onScrollTo = true;
            animatingScroll = false;
        });
    };


    var menuAndNavSetup = function() {

        var offset = 0;

        $menuLinks.each(function(index) {
            var $this = $(this),
                    sectionName = $this.attr('data-section-name');

            History.on('!/' + sectionName, function(s) {

                animatingScroll = true;

                var onScrollTo = false;

                if (sectionName != 'matrimonio') {
                    offset = -50;

                }

                $('.main_navigation').css('position', 'fixed').css('top', '0');



                $('#wrapper').scrollTo($('#' + sectionName), 800, {
                    offset: offset,
                    onAfter: function() {

                        if (onScrollTo)
                            return;

                        onScrollTo = true;

                        animatingScroll = false;

                    }
                });
            });

            $this.click(function(e) {
                e.preventDefault();
                //console.log('hello: ',$this.attr('data-section-name'));
                $menuLinks.removeClass('active');
                $('*[data-section-name="' + $this.attr('data-section-name') + '"]')
                        .addClass('active');

                History.go('!/' + sectionName);
            });
        });


        History.on('!/', function(s) {
            menuScroll(0);
        });

        History.on('', function(s) {
            menuScroll(0);
        });


        $('.logo').click(function(e) {
            e.preventDefault();
            History.go('!/');
        });

        $menuLinks.on('click', function() {
            //var $this = $(this);
//            if($(".navbar-collapse").hasClass('in')){
//                $(".navbar-collapse").removeClass('in');
//                 $(".navbar-collapse").css('height', '1px');
//                             $this.removeClass('active');
//            }

            $('.navbar-collapse.in').collapse('hide');


        });


        var currentSection = 0, menuNavFixed = false;

        $('#wrapper').scroll(function() {

            var height = $('#wrapper').scrollTop(),
                    $this = $(this),
                    thisOffset = '50px';


            if (animatingScroll)
                return;

            var has = false,
                    dataSection = '',
                    viewPortHeight = $(window).height(),
                    offset = -$('#main').position().top - 50,
                    matrimonioHeight = $('#matrimonio').height(),
                    matrimonioPosition = $('#matrimonio').position().top + offset,
                    nosotrosHeight = $('#nosotros').height(),
                    nosotrosPosition = $('#nosotros').position().top + offset,
                    albumHeight = $('#album').height(),
                    albumPosition = $('#album').position().top + offset,
                    regalosHeight = $('#album').height(),
                    regalosPosition = $('#regalos').position().top + offset,
                    informacionHeight = $('#informacion').height(),
                    informacionPosition = $('#informacion').position().top + offset,
                    mensajesHeight = $('#mensajes').height(),
                    mensajesPosition = $('#mensajes').position().top + offset,
                    rsvpHeight = $('#rsvp').height(),
                    lastHeight = mensajesHeight + rsvpHeight - 50,
                    rsvpPosition = $('#rsvp').position().top + offset,
                    $navMenu = $('.main_navigation');


            if (height < matrimonioPosition && menuNavFixed) {
                menuNavFixed = false;
                $navMenu.removeAttr('style');
            } else if (height >= matrimonioPosition && !menuNavFixed) {
                menuNavFixed = true;
                $navMenu.css('visibility', 'hidden').css({'position': 'fixed', 'top': '0'}).css('visibility', 'visible');
                //$navMenu.css({'position': 'fixed', 'top': '0'});
            }


            if (height < matrimonioPosition && currentSection != 0) {
                has = true;
                currentSection = 0;
                dataSection = "";
            } else if ((height >= matrimonioPosition) && (height < nosotrosPosition) && currentSection != 1) {
                has = true;
                currentSection = 1;
                dataSection = "matrimonio";
            } else if ((height >= nosotrosPosition) && (height < albumPosition) && currentSection != 2) {
                has = true;
                currentSection = 2;
                dataSection = "nosotros";
            } else if ((height >= albumPosition) && (height < informacionPosition) && currentSection != 3) {
                has = true;
                currentSection = 3;
                dataSection = "album";
            } else if ((height >= informacionPosition) && (height < regalosPosition) && currentSection != 4) {
                has = true;
                currentSection = 4;
                dataSection = "informacion";
            } else if ((height >= regalosPosition) && (height < mensajesPosition) && currentSection != 5) {
                has = true;
                currentSection = 5;
                dataSection = "regalos";
            } else if ((height >= mensajesPosition) && height < rsvpPosition && currentSection != 6) {
                has = true;
                currentSection = 6;
                dataSection = "mensajes";
            } else if (height >= rsvpPosition && currentSection != 7) {
                has = true;
                currentSection = 7;
                dataSection = "rsvp";
                //$menuLinks.removeClass('selected');
            }

            if (has) {

                $menuLinks.removeClass('active');
                $('*[data-section-name="' + dataSection + '"]')
                        .addClass('active');

                History.change('!/' + dataSection);

            }

        });

//        if ($(window).width() < screenSizeMobile && !band) {
//            menuResize();
//        }


    };
    /************************************** End Menu ***************************************/


    /**************************************** Matrimonio ****************************************/


    var gMap = function() {

        var
                myLatlng = new google.maps.LatLng(4.663324, -74.056400),
                myLatlng2 = new google.maps.LatLng(10.4116521, -75.5366938);

        var image = new google.maps.MarkerImage("/app/images/pin.png",
                // This marker is 20 pixels wide by 32 pixels tall.
                new google.maps.Size(42, 48),
                // The origin for this image is 0,0.
                new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at 0,32.
                new google.maps.Point(15, 42)
                );

        var styledMapOptions = [
            {
                "featureType": "administrative.province",
                "elementType": "labels",
                "stylers": [
                    {"visibility": "off"},
                    {"saturation": 39}
                ]
            }, {
                "featureType": "water",
                "stylers": [
                    {"visibility": "on"},
                    {"saturation": -69},
                    {"color": "#7f8080"},
                    {"gamma": 2.94},
                    {"lightness": 94}
                ]
            }, {
                "featureType": "landscape",
                "stylers": [
                    {"visibility": "on"},
                    {"gamma": 1.71},
                    {"saturation": -2},
                    {"color": "#7d8080"},
                    {"lightness": 89}
                ]
            }, {
                "featureType": "administrative",
                "stylers": [
                    {"visibility": "on"},
                    {"lightness": 9},
                    {"saturation": -56}
                ]
            }, {
                "featureType": "poi",
                "stylers": [
                    {"visibility": "off"}
                ]
            }, {
                "featureType": "road.highway",
                "stylers": [
                    {"saturation": -25},
                    {"lightness": 28},
                    {"visibility": "off"}
                ]
            }, {
                "featureType": "transit",
                "stylers": [
                    {"visibility": "simplified"}
                ]
            }, {
                "featureType": "road.arterial",
                "stylers": [
                    {"saturation": 6},
                    {"gamma": 0.34},
                    {"lightness": 59}
                ]
            }, {
            }
        ];

        var mapOptions = {
            zoom: 4,
            center: myLatlng
        };

        var map = new google.maps.Map(document.getElementById("map-canvas"),
                mapOptions);

        var styleMapType = new google.maps.StyledMapType(styledMapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: "Fiesta entrega de regalos",
            icon: image,
            animation: google.maps.Animation.DROP
        });

        var marker2 = new google.maps.Marker({
            position: myLatlng2,
            map: map,
            title: "Ceremonia Religiosa",
            //draggable: true,
            icon: image,
            animation: google.maps.Animation.DROP
        });

        map.mapTypes.set('webdemiboda', styleMapType);
        map.setMapTypeId('webdemiboda');

    };

    var matrimonioSetup = function() {

        var
                $layerMap = $('#layer_map', $mainContainer),
                gmapActive = false;

        $('#gmapLink').off().on('click', function() {

            $layerMap.fadeIn(function() {
                if (gmapActive)
                    return;

                gmapActive = true;
                gMap();
            });

        });

        $layerMap.off().on('click', function() {
            $(this).fadeOut();
        });

        $('#close_map').off().on('click', function() {
            $layerMap.trigger('click');
        });

        $('div.cont_map').off().on('click', function(e) {
            e.stopPropagation();
        });
    };

    /************************************** End Matrimonio ***************************************/


    /**************************************** Album ****************************************/


    var layerPhotoOpen = function($this, src, $layerPhotos) {

        $layerPhotos.fadeIn(function() {

            preLoadImg(src).then(function(res) {
                if (!res.error) {
                    $this[0].src = src;
                    $('#photo_load', $layerPhotos).hide();
                    $('#slides img', $layerPhotos).attr('src', $this[0].src);
                }
            });

        });

    };

    var layerPhotoClose = function($this, $layerPhotos) {
        $this.fadeOut(function() {
            var placeholder = $('#slides img', $layerPhotos).attr('data-img-src');
            $('#slides img', $layerPhotos).attr('src', placeholder);
            $('#photo_load', $layerPhotos).show();
        });
    };

    var albumSetup = function() {

        var
                $grid = $('#grid', $album),
                $layerPhotos = $('#layer_photos', $mainContainer),
                $filterOptions = $('.filter-options'), //$sizer = $grid.find('.shuffle__sizer');
                $loadMore = $('#load_more', $album),
                activeGroup = 'all',
                arrayImages = [],
                currentImage = "",
                totalPhotos = 0,
                currentStack = 7;

        totalPhotos = $('.picture-item', $grid).length;

        $.each($('.picture-item', $grid), function() {
            var $this = $(this);
            if ($this.index() > 7)
                $this.hide();
        });

        $grid.shuffle({
            itemSelector: '.picture-item' //,
                    //sizer: $sizer
        });


        var $btns = $filterOptions.children();
        $btns.on('click', function() {
            var $this = $(this),
                    isActive = $this.hasClass('active'),
                    group = isActive ? 'all' : $this.data('group');

            activeGroup = group;

            if (activeGroup == 'all') {
                $loadMore.animate({opacity: 1});
            } else {
                $loadMore.animate({opacity: 0});
            }

            // Hide current label, show current label in title
            if (!isActive) {
                $('.filter-options .active').removeClass('active');
            }

            $this.toggleClass('active');

            // Filter elements
            $grid.shuffle('shuffle', group);
        });



        $('a', $grid).off().on('click', function() {
            var $this = $(this),
                    src = $('img', $this).attr('data-img-src'),
                    groupImgs = [];

            $.each($('div.picture-item'), function() {
                var $this = $(this);
                if ($this.attr('data-groups').indexOf(activeGroup) > -1 || activeGroup == 'all')
                    groupImgs.push($('img', $this).attr('data-img-src'));
            });
            arrayImages = groupImgs;
            currentImage = src;

            layerPhotoOpen($this, src, $layerPhotos);
        });

        $layerPhotos.off().on('click', function() {

            layerPhotoClose($(this));
        });

        $('#close_photos', $layerPhotos).off().on('click', function() {
            $layerPhotos.trigger('click');
        });

        $('div.cont_img', $layerPhotos).off().on('click', function(e) {
            e.stopPropagation();
        });

        $('#photo_left', $layerPhotos).off().on('click', function(e) {
            var nextImage = '';

            $.each(arrayImages, function(k, v) {
                if (currentImage == v && nextImage == '') {
                    nextImage = arrayImages[k - 1];
                    return;
                }
            });

            if (typeof(nextImage) == 'undefined')
                nextImage = arrayImages[arrayImages.length - 1];

            preLoadImg(nextImage).then(function(res) {
                $('#photo_load', $layerPhotos).fadeIn();
                if (!res.error) {
                    $('#slides img', $layerPhotos).fadeOut('slow', function() {
                        $('#photo_load', $layerPhotos).hide();
                        $(this).attr('src', nextImage).fadeIn('slow');
                    });

                    currentImage = nextImage;
                }
            });
        });

        $('#photo_right', $layerPhotos).off().on('click', function(e) {
            var nextImage = '';

            $('#photo_load', $layerPhotos).fadeIn();

            $.each(arrayImages, function(k, v) {
                if (currentImage == v && nextImage == '') {
                    nextImage = arrayImages[k + 1];
                    return;
                }
            });

            if (typeof(nextImage) == 'undefined')
                nextImage = arrayImages[0];

            preLoadImg(nextImage).then(function(res) {
                if (!res.error) {
                    $('#slides img', $layerPhotos).fadeOut('slow', function() {
                        $('#photo_load', $layerPhotos).hide();
                        $(this).attr('src', nextImage).fadeIn('slow');

                    });

                    currentImage = nextImage;
                }
            });
        });



        if (totalPhotos > 8)
            $loadMore.parent().show();



        $grid.on('layout.shuffle', function() {
            if (currentStack + 1 >= totalPhotos)
                $loadMore.animate({opacity: 0});
        });


        $loadMore.off().on('click', function(e) {
            if (activeGroup != 'all')
                return false;
            //console.log('currentStack: ', currentStack + 1, totalPhotos);
            if (currentStack + 1 >= totalPhotos)
                return false;

            var $collection = $();

            var i;
            for (i = currentStack + 2; i <= currentStack + 5; i++) {
                $collection = $collection.add($('.picture-item[data-photo=' + i + ']', $grid).show());
            }
            currentStack += 4;

            $grid.append($collection);
            $grid.shuffle('appended', $collection);

        });

    };

    /************************************** End Album ***************************************/


    /**************************************** Mensajes ****************************************/


    var _queryMessage = function(offset, limit, $el) {

        $.ajax({
            type: "POST",
            url: "./service/",
            async: true,
            dataType: 'json',
            data: $.param({
                action: '/s/Main/query_message.json',
                offset: offset,
                limit: limit
            }),
            'success': function(data) {

                var
                        info = data.data,
                        html = "";

                if (typeof(info) == 'undefined')
                    return;

                if (typeof(info.messages) == 'undefined')
                    return;

                $.each(info.messages, function(k, v) {
                    html = '<li><span class="heart"></span><p>' + v.message + '</p><p>' + v.name + '</p></li>';
                    $('ul', $el).append(html);
                });

                _isLoading = false;
                _offset = parseInt(_offset) + parseInt(_limit);
                _nextPage = info.next;
            }
        });
    };


    var mensajesSetup = function() {

        var
                $submit = $('#enviarMensaje', $mensajes),
                $messageName = $('#tbl_contact_name', $mensajes),
                $messageMail = $('#tbE_contact_email', $mensajes),
                $messageMessage = $('#tbl_contact_message', $mensajes),
                $msgDisplay = $('#message_display', $mensajes),
                $loadingBtn = $('#loading_btn', $mensajes),
                $messagesBox = $('#messages_box', $mensajes),
                $mensajesForm = $('#mensajes_form', $mensajes);

        $submit.off().on('click', function(e) {
            e.preventDefault();
            if (_isUploading) {
                return false;
            }
            _isUploading = true;
            $loadingBtn.show();

            var resultValidateForm = Das.SiteUtil.checkFormOnClick($mensajesForm);

            if (resultValidateForm) {
                var post_data = $mensajesForm.serialize();

                $('.alert').hide();

                $.ajax({
                    type: "POST",
                    dataType: 'json',
                    url: "./service/",
                    async: true,
                    cache: false,
                    data: $.param({
                        action: '/s/Main/sendPost.json'
                    }) + '&' + post_data,
                    'success': function(msg) {
                        //console.log('msg: ', msg);
                        if (msg.status == 200) {
                            $msgDisplay.show().html('Tu mensaje ha sido enviado y será revisado por los novios antes de ser publicado.');
                        } else {
                            $msgDisplay.show().html('Lo sentimos, hay un problema de conexión, por favor intente de nuevo más tarde.');
                        }

                        $messageName.val('');
                        $messageMail.val('');
                        $messageMessage.val('');

                        _isUploading = false;
                        $loadingBtn.hide();

                    }
                });
            } else {
                _isUploading = false;
                $loadingBtn.hide();
            }
        });


        $messagesBox.scroll(function() {
            var $this = $(this);
            if ($this.scrollTop() + $this.innerHeight() >= this.scrollHeight) {
                if (_nextPage) {
                    if (_isLoading)
                        return;
                    _queryMessage(_offset, _limit, $messagesBox);
                }
            }
        });
    };

    /************************************** End Mensajes ***************************************/


// Page Setup Flow
    (function() {

        // Page Images PreLoader
        pageImgPreloader()

                // page content load
                .then(function() {

            $mainContainer = $('#main-container');

            var d = $.Deferred();

            $(window).load(function() {
                $('#main-loading').css('display', 'none');
                $('#main-container').css('display', 'block');

                setTimeout(function() {
                    d.resolve();
                }, 0);

            });
            return d.promise();
        })

                // menu & nav
                .then(function() {
            menuAndNavSetup();
        })

                // Matrimonio Setup
                .then(function() {

            matrimonioSetup();

        })

                // Album Setup
                .then(function() {

            $album = $('#album', $mainContainer);

            albumSetup();

        })

                // Mensajes Setup
                .then(function() {

            $mensajes = $('#mensajes', $mainContainer);

            mensajesSetup();

        })

                // Lazy Image Loader
                .then(function() {

//            $(window).resize(function() {
//                menuResize();
//                var screenWidth = $(window).width();
//
//                if (deviceType == "desktop") {
//                    if (screenWidth <= screenSizeMobile) {
//                        $('#wrapper').removeClass('web').addClass('mobile');
//                    } else {
//                        $('#wrapper').removeClass('mobile').addClass('web')
//                    }
//                }
//
//            });

            if (deviceType == "desktop") {
                //$('div.parallax_1.low,div.parallax_2.low,div.parallax_3.low,div.parallax_4.low')
                $('div.parallax_1.low')
                        .each(function() {
                    var $div = $(this), src, img;

                    if (!$div.is('[data-img-src]'))
                        return;

                    src = $div.attr('data-img-src');

                    preLoadImg(src).then(function(res) {
                        if (!res.error)
                            $div.removeClass('low').addClass('high');
                    });
                });
            }

        })

                .then(function() {

            //$(window).trigger('resize');

            History.init();
        });
    })();


})(jQuery);
