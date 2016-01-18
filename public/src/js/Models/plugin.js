define(function (require) {
    var mockJson = require("inputData/plugin_JSON_Mock"),
        _ = require("lodash"),
        $ = require("jquery"),
        dust = require("dust");
        require("dustHelper");

    var authorMode_tmpl = require("text!../../templates/_pa-brand-info-render__authtor.dust"),
        publishMode_tmpl = require("text!../../templates/_pa-brand-info-render__publish.dust");

    var compiled_authorMode_tmpl = dust.compile(authorMode_tmpl, "pa-brand-info-render__authtor"),
        compiled_publishMode_tmpl = dust.compile(publishMode_tmpl, "pa-brand-info-render__publish");

    dust.loadSource(compiled_authorMode_tmpl);
    dust.loadSource(compiled_publishMode_tmpl);




    var CTC = {};


    /**
     *CTCPlugin
     * */
    var CTC = (function (ctc) {
        ctc.modules = ctc.modules || {};

        /*for Jasmine test*/
        ctc.tests = ctc.tests || {};
        /*for Jasmine test*/

        function BrandsDataFeeder(opts) {
            console.log("Init BrandsDataFeeder component");


            this.opts = $.extend(true, {}, this.defaults, opts);

            var $self = opts.$elem,
                $brands = $self.find(".pa-brand-info__brandcomponent"),
                rowsNaming = $('.pa-brand-comparison-page__popupcontainer').data('labels'),
                MAX_COMPONENTS_ON_PAGE = 6, // according to CTCODCQ-6261
                SERVLET_URL = "/services/instore/getbrandsinfojson",
                CONTAINER_TABLE_ID = "#comparisonTable",
                GR_POPUP_BACKGROUND = "#EEE",
                MAX_PRICE_VALUE = "$$$$$",
                RATING_STAR_WIDTH = 14;

            function renderBrands() {
                /*jQuery.ajax({
                 dataType: "json",
                 url: SERVLET_URL,
                 async: false,
                 success: onSuccess
                 });
                 */
                var onSuccess = function (response) {
                    var brandsName = rowsNaming;
                    var newJson = parseJson(response, brandsName);

                    if (isPublishMode()) {
                        authorRender(newJson);
                    } else {
                        publishRender(newJson)

                    }
                };

                onSuccess(mockJson)

            }


            function isPublishMode() {
                //return !(CQ.WCM && CQ.WCM.isEditMode());
                return false;
            }

            /**
             * render for Author mode
             * */
            function authorRender(json) {
                var $wrapper = $("body");
                dust.render("pa-brand-info-render__authtor", {"json": json}, function (err, out) {
                    if (err) {
                        console.log('Dust error: ' + err);
                    } else {
                        $wrapper.html(out);
                    }
                });
            }

            function publishRender(json) {
                var $wrapper = $("body");
                dust.render("pa-brand-info-render__publish", {"json": json}, function (err, out) {
                    if (err) {
                        console.log('Dust error: ' + err);
                    } else {
                        $wrapper.html(out);
                    }
                });
            }

            function publishFlow(response) {
                var actualRowCount = 1,
                    cellWidth = calculateCellWidth(response);

                dust.render("pa-brand-comparison-render", rowsNaming, function (err, out) {
                    if (err) {
                        log('Dust error: ' + err);
                    } else {
                        var $footNotes = $self.find('.footnotes'),
                            $parsys = $self.find(".parsys");
                        $parsys.html(out);

                        if ($footNotes.length > 0) {
                            $parsys.append($footNotes);
                        }
                    }
                });

                $.each(response, function (index, brandInfo) {
                    if (actualRowCount <= MAX_COMPONENTS_ON_PAGE) {
                        if (brandInfo.brandContentError) {
                            return; //like continue
                        } else {
                            preparePriceToRender(brandInfo);
                            addColumn(CONTAINER_TABLE_ID, brandInfo, cellWidth);

                            actualRowCount++;
                        }
                    }
                });

                if (actualRowCount > MAX_COMPONENTS_ON_PAGE) {
                    actualRowCount = MAX_COMPONENTS_ON_PAGE;
                }

                correctPopupBackground(GR_POPUP_BACKGROUND);
            }

            /**
             * Parser input json and adduction  to  required form for rendering
             * @param {json} Object
             * @returns Object
             * */
            function parseJson(json, brandsName) {
                var countItemAtPage = $brands.length,
                    copyJson,
                    brandContentError,
                    newJson = [];

                //copy of input object
                copyJson = _.clone(json, true);

                //brandContentError
                brandContentError = _.pluck(copyJson, 'brandContentError')[0];

                /**
                 * change the display of prices, depending on the input parameters
                 *
                 * @params brand Object
                 * @returns  boolean
                 * */
                function isUndefinedBrand(brand) {
                    return typeof brand.name != 'string' ? true : false;
                }

                /**
                 * change the display of prices, depending on the input parameters
                 *
                 * @params brand Object
                 * @returns  Object
                 * */
                function changeDisplayPrice(brand) {
                    var modifedPrice = {};
                    modifedPrice.greenPrice = brand.greenPrice = "";
                    modifedPrice.greyPrice = MAX_PRICE_VALUE;

                    if (brand.priceRepresent) {
                        modifedPrice.greenPrice = modifedPrice.greyPrice.slice(brand.priceRepresent.length);
                        modifedPrice.greyPrice = modifedPrice.greyPrice.slice(modifedPrice.greenPrice.length);
                    }

                    return modifedPrice;
                }

                function defineContentError(brand) {
                    return brand.brandContentError === brandContentError ? true : false;
                }

                /**
                 * change the display of average rating, depending on the input parameters
                 *
                 * @params  {} brand
                 * @returns  string
                 * */
                function changeAverageRating(brand) {
                    return (!brand.averageRating || brand.averageRating === 'N/A') ? 'N/A' : brand.averageRating;
                }

                //formation of a new object
                _.forEach(copyJson, function (item) {
                    var obj = {};
                    obj.brand = item.name;

                    //if brand is define or 'undefined'
                    obj.isUndefinedBrand = isUndefinedBrand(item);

                    //change display for price
                    var newPrice = changeDisplayPrice(item);


                    //define average rating
                    var averageRating = changeAverageRating(item);

                    //header content
                    obj.contentError = {
                        name: "Brand Path does not exist",
                        value: defineContentError(item)
                    };

                    obj.brandName = {
                        name: "Brands",
                        value: item.name,
                    };

                    obj.imageLink = {
                        name: "imageLink",
                        value: item.value
                    };

                    //define average rating
                    obj.price = {
                        name: "price",
                        value: item.priceRepresent,
                        greenPrice: newPrice.greyPrice,
                        greyPrice: newPrice.greenPrice
                    };
                    obj.rating = {
                        name: brandsName.ratingLabel,
                        value: averageRating
                    };
                    obj.easyApplication = {
                        name: brandsName.easyApplicationLabel,
                        value: item.easyApplication
                    };
                    obj.builtInPrimer = {
                        name: brandsName.builtInPrimerLabel,
                        value: item.builtInPrimer
                    };
                    obj.durability = {
                        name: brandsName.durabilityLabel,
                        value: item.durability
                    };
                    obj.scrubbability = {
                        name: brandsName.scrubbabilityLabel,
                        value: item.scrubbability
                    };
                    obj.moldAndMildewResistance = {
                        name: brandsName.moldAndMildewResistanceLabel,
                        value: item.moldAndMildewResistance
                    };
                    obj.stainFighting = {
                        name: brandsName.stainFighting,
                        value: item.stainFighting
                    };
                    obj.vocLevel = {
                        name: brandsName.vocLevelLabel,
                        value: brandsName.vocLevelLabel
                    };

                    //saving changed object
                    newJson.push(obj)

                });
                var brands = _.pluck(copyJson, 'name');

                //rowsNaming
                console.log(newJson)
                return newJson;
            }


            function preparePriceToRender(brandInfo) {
                brandInfo.greenPrice = "";
                brandInfo.greyPrice = MAX_PRICE_VALUE;
                if (brandInfo.priceRepresent) {
                    brandInfo.greenPrice = brandInfo.priceRepresent;
                    brandInfo.greyPrice = brandInfo.greyPrice.slice(brandInfo.greenPrice.length);
                }

            }

            function prepareRatingToRender(averageRating) {
                if (!averageRating || averageRating === 'N/A') {
                    return 'N/A';
                }
                return '<div class="grey-star-rating"><div class="red-star-rating" style="width: ' + averageRating * RATING_STAR_WIDTH + 'px;"></div></div>';
            }

            function addColumn(tblId, brandInfo, cellWidth) {
                dust.render("pa-brand-info-image-block-render", brandInfo, function (err, out) {
                    if (err) {
                        console.log('Dust error: ' + err);
                    } else {
                        $(tblId + " tr.first_line:first").append("<td class='image_header_block' style='width:" + cellWidth + "px; max-width:" + cellWidth + "px;'>" + out + "</td>");
                    }
                });

                var start_td_tag = "<td class='data_cell' style='width:" + cellWidth + "px; max-width:" + cellWidth + "px;'>";

                $(tblId + " tr.data_row:eq(0)").append(start_td_tag + '<p class="pa-brand-info__price"><span class="pa-brand-info__price-green">'
                    + brandInfo.greenPrice + '</span><span class="pa-brand-info__price-grey">' + brandInfo.greyPrice + '</span></p></td>');
                $(tblId + " tr.data_row:eq(1)").append(start_td_tag + prepareRatingToRender(brandInfo.averageRating) + "</td>");
                $(tblId + " tr.data_row:eq(2)").append(start_td_tag + brandInfo.easyApplication + "</td>");
                $(tblId + " tr.data_row:eq(3)").append(start_td_tag + brandInfo.builtInPrimer + "</td>");
                $(tblId + " tr.data_row:eq(4)").append(start_td_tag + brandInfo.durability + "</td>");
                $(tblId + " tr.data_row:eq(5)").append(start_td_tag + brandInfo.scrubbability + "</td>");
                $(tblId + " tr.data_row:eq(6)").append(start_td_tag + brandInfo.moldAndMildewResistance + "</td>");
                $(tblId + " tr.data_row:eq(7)").append(start_td_tag + brandInfo.stainFighting + "</td>");
                $(tblId + " tr.data_row:eq(8)").append(start_td_tag + brandInfo.vocLevel + "</td>");
            }

            function correctPopupBackground(bgcolor) {
                var $controller__popup = $('.gr-popup-controller__popup-content', window.parent.document);
                if ($controller__popup.length > 0) {
                    $controller__popup.css('background', bgcolor);
                    $controller__popup.css('border', "0");
                }
            }

            /* count only valid items and only in publish mode */
            function calculateCellWidth(response) {
                var miss = 0;

                $.each(response, function (index, brandInfo) {
                    if (brandInfo.brandContentError) {
                        miss++
                        return;
                    }
                });

                var length;
                if ((response.length - miss) > MAX_COMPONENTS_ON_PAGE) {
                    length = MAX_COMPONENTS_ON_PAGE;
                    miss = 0;
                } else {
                    length = response.length;
                }

                // 140 - first column's width - 1 - to keep 1 pixel it will remain after /;
                var cellWidth = (($('.gr-popup-controller__popup-content', window.parent.document).width() - 140) / (length - miss)).toFixed(2);

                return cellWidth;
            }

            //renderBrands();
            renderBrands(mockJson)
        }

        BrandsDataFeeder.prototype = {
            defaults: {
                selector: '.pa-brand-comparison-page__popupcontainer'
            }
        };


        ctc.modules.BrandsDataFeeder = BrandsDataFeeder;
        return ctc;
    }(CTC));

    /**
     * CTCPlugin
     **/

    return CTC;
});