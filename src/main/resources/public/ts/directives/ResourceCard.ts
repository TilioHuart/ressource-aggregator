import {idiom, ng, toasts} from 'entcore';
import http from 'axios';
import {hashCode} from '../utils';

import * as Clipboard from 'clipboard';

import {FavoriteService} from "../services";
import {ResourceBody} from "../model";

declare const window: Window;

export const ResourceCard = ng.directive('resourceCard',
    ['$timeout', 'FavoriteService', function ($timeout, FavoriteService: FavoriteService) {
        return {
            scope: {
                ngModel: '=',
                type: '@?'
            },
            template: `
            <div ng-include="getTemplate()" class="flex [[type]]"></div>
        `,
            link: function ($scope, element) {
                $scope.safeApply = () => {
                    let phase = $scope.$root.$$phase;
                    if (phase !== '$apply' && phase !== '$digest') {
                        $scope.$apply();
                    }
                };
                $scope.idiom = idiom;
                $scope.type = $scope.type || 'resource';
                const colors = ["#f78d3f", "#fcd271", "#2bbbd8", "#102e37"]; // orange, yellow, blue, black
                let clipboard;
                let random = Math.floor(Math.random() * colors.length) + 1;
                let signetId = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16)
                });
                /*                $scope.background = `/mediacentre/public/img/random-background-${random}.svg`;*/
                if ("fr.openent.mediacentre.source.Signet" === $scope.ngModel.source
                    || !$scope.ngModel.hash && !$scope.ngModel.id) {
                    $scope.ngModel.hash = hashCode(signetId);
                } else if (!$scope.ngModel.hash) {
                    hashCode($scope.ngModel.id)
                }
                $scope.show = {
                    toolip: false,
                    loader: true
                };

                $scope.cropImage = function (crop,image) {
                    //Get default image size
                    const i = new Image();
                    i.onload = () => {
                        crop.css('max-width', `${image.width * 0.4}px`);
                        image.setAttribute('style', 'max-width: 125%;');
                        $scope.show.loader = false;
                        $scope.safeApply();
                    };
                    i.src = image.src;
                }

                $scope.$on("$includeContentLoaded", function () {
                    if ("fr.openent.mediacentre.source.GAR" === $scope.ngModel.source) {
                        const crop = element.find('.resource-card .crop');
                        const image: HTMLImageElement = crop.children()[0];

                        $timeout(() => {
                            if (image && !image.complete) {
                                $(image).on('load', $scope.cropImage(crop,image));
                            } else {
                                $scope.cropImage(crop,image);
                            }
                        });
                    }

                    const addColoredBar = function () {
                        let hash = $scope.ngModel.hash;
                        if($scope.ngModel.hash == undefined){
                            hash = ''
                        }
                        const parent = element.find(`#color-${hash}`).parent();
                        parent.css("border-radius", "inherit");
                        parent.css("padding-left", "10px");
                        parent.css("background-color", colors[random - 1]);
                    };

                    const manageSizes = function () {
                        if(screen.width < 600){
                            element.css("margin", "10px");
                        }else{
                            element.css("margin", "10px 30px");
                        }
                    };

                    $timeout(() => {
                        if ('fr.openent.mediacentre.source.GAR' !== $scope.ngModel.source) {
                            $scope.show.loader = false;
                        }
                        if ($scope.type === "complete-card") {
                            addColoredBar();
                        } else if ($scope.type === "mini-card") {
                            addColoredBar();
                            manageSizes();
                        }
                        const clipboardSelector = `.clipboard.${$scope.type}-resource-${$scope.ngModel.hash}`;
                        const clipboardElement = element.find(clipboardSelector);
                        new Clipboard(clipboardSelector)
                            .on('success', () => {
                                $scope.show.tooltip = true;
                                $scope.$apply();
                                clipboardElement.on('mouseleave', () => {
                                    $scope.show.tooltip = false;
                                    $scope.$apply();
                                });
                            })
                            .on('error', console.error);
                        $scope.safeApply();
                    });
                });

                $scope.checkIfLoaded = function () {
                    $timeout(() => {
                        if ("fr.openent.mediacentre.source.GAR" === $scope.ngModel.source && $scope.show.loader) {
                            const crop = element.find('.resource-card .crop');
                            const image: HTMLImageElement = crop.children()[0];
                            if (image && !image.complete) {
                                $(image).on('load', $scope.cropImage(crop, image));
                            } else {
                                $scope.cropImage(crop, image);
                            }
                        }
                    }, 3000);
                }

                $scope.checkIfLoaded();

                $scope.$on('$destroy', function () {
                    if (clipboard) {
                        clipboard.destroy();
                    }
                });

                $scope.open = function () {
                    window.open($scope.ngModel.link);
                };

                $scope.addFavorite = async function () {
                    $scope.ngModel.favorite = undefined;
                    let resourceId: number = $scope.ngModel.source == "fr.openent.mediacentre.source.Signet" ?
                        parseInt($scope.ngModel.id_info) : undefined;
                    let response = await FavoriteService.create(new ResourceBody($scope.ngModel).toJson(), resourceId);
                    if (response.status === 200) {
                        $scope.$emit('addFavorite', $scope.ngModel);
                    }
                    $scope.safeApply();
                };

                $scope.removeFavorite = async function () {
                    let resourceId: string = $scope.ngModel.source == "fr.openent.mediacentre.source.Signet" ?
                        parseInt($scope.ngModel.id_info) : $scope.ngModel._id;
                    let response = await FavoriteService.delete(resourceId, $scope.ngModel.source);
                    if (response.status === 200) {
                        $scope.$emit('deleteFavorite', $scope.ngModel.id);
                    }
                    $scope.safeApply();
                };

                $scope.getTemplate = function () {
                    return `/mediacentre/public/template/resources/${$scope.type}.html`;
                };

                $scope.copyLink = (): void => {
                    toasts.confirm(idiom.translate("mediacentre.link.copy.success"));
                }

                $scope.displayTitle = function (title:string) {
                    // If title hasn't any kind of whitespace
                    if (!(/\s/.test(title.substr(0,25))) && title.length > 25){
                        title = title.substr(0,20) + "...";
                    }
                    return title;
                };

                $scope.action = async function () {
                    const {method, target, url, message} = $scope.ngModel.action;
                    if (method === 'GET' && target && target === '_blank') {
                        window.open(url);
                    }
                    else {
                        try {
                            await http({method, url});
                            toasts.confirm(message.success);
                        } catch (e) {
                            toasts.warning(message.error);
                            throw e;
                        }
                    }
                }

                $scope.getImgLink = async (imgId) : Promise<boolean> => {
                    try{
                        let data = await http.get(`${imgId}`);
                        console.log(imgId, data.status);
                        return data.status < 400;
                    }
                    catch (err)
                    {
                        console.log(imgId, err);
                        return false;
                    }

                }
            }
        }
    }]);