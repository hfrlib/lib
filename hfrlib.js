/**
 * @file hfrlib.js
 * @author n0m1s
 * @version 0.0.2
 * @date 2018-03-06
 */

(function(HFRlib, undefined) {

    /**********
     * CONSTS *
     **********/

    HFRlib.BaseURL = "https://forum.hardware.fr/";
    HFRlib.MPURL = HFRlib.BaseURL + "forum1.php?cat=prive";

    /**********
     * PUBLIC *
     **********/

    HFRlib.InitScript = function(script_name) {
        initCoreStyle();
        initSettingsPanel();

        return {
            Name: script_name,
            ID: toID(script_name)
        };
    };

    HFRlib.DeclareScriptSettings = function(script, settings) {
        var settingsBlock = getOrCreateSettingsBlock(script, settings);

        for(var i in settings) {
            settingsBlock.appendChild(settings[i]);
        }
        //TODO
    };

    HFRlib.Settings = {
        Checkbox : function(label, id) {return gui.settings.setting(label, gui.settings.checkbox(id));},
        Combobox : function(label, values, id) {return gui.settings.setting(label, gui.settings.combobox(values, id));},
        Text : function(label, id) {return gui.settings.setting(label, gui.settings.text(id));}
    };

    HFRlib.Storage = {
        GetValue : function(script, name, fallbackValue) {
            return fallbackValue;
            //TODO
        },

        SetValue : function(script, name, value) {
            //TODO
        }
    };

    HFRlib.Page = function(url, anonymously, callback) {
        loadPage(url, anonymously, callback);
    }

    HFRlib.CurrentPage = function() {
        return parsePage(window.location.href, document);
    };

    HFRlib.PageType = Object.freeze({
        Undefined: 0,
        TopicList: 1,
        Topic: 2
    });

    //TODO remove tmp func
    HFRlib.TmpGetMpJson = function() {
        loadPage(HFRlib.MPURL, false, function(page) {
            alert("loaded MP page");
        });
    };

    /***********
     * PRIVATE *
     ***********/

    const LIB = "HFRlib";

    function toID(string) {
        var id = encodeURIComponent(string);
        return id;
    }

    const STYLE_ID = LIB + "_style";
    const CORE_STYLE_ID = STYLE_ID + "_core";

    function hasCoreStyle() {
        return document.getElementById(CORE_STYLE_ID) !== null;
    }

    function initCoreStyle() {
        if(hasCoreStyle()) return;

        //TODO: multiple style handling
        var coreStyle = document.createElement("link");
        coreStyle.id = CORE_STYLE_ID;
        coreStyle.rel = "stylesheet";
        coreStyle.type = "text/css";
        coreStyle.href = "https://rawgit.com/hfrlib/style/master/hfrlib_core.css";

        document.head.appendChild(coreStyle);
    }

    const SETTINGS_PANEL_ID = LIB + "_settingsPanel";

    function hasSettingsPanel() {
        return document.getElementById(SETTINGS_PANEL_ID) !== null;
    }

    function initSettingsPanel() {
        if(hasSettingsPanel())
            return;

        //creating button
        try {
            var settingsButtonContainer = document.querySelector("table.hfrheadmenu table > tbody > tr:nth-child(2) > td td:nth-child(1)");

            settingsButtonContainer.appendChild(document.createTextNode(" | "));
            settingsButtonContainer.appendChild(createScriptButton("cHeader"));
        } catch (e) {
            return;
        }

        //creating panel
        var settingsPanelContainer = document.createElement("div");
        settingsPanelContainer.id = SETTINGS_PANEL_ID;

        settingsPanelContainer.appendChild(createShadingElement());
        settingsPanelContainer.appendChild(createSettingsPanel());
        document.body.appendChild(settingsPanelContainer);
    }

    var gui = {
        /**
        * @brief creates a text in a tag: <type>text</type>
        *
        * @param type: the tag
        * @param text: the text
        *
        * @return the created element
        */
        createSimpleElement : function(type, text) {
            var elmt = document.createElement(type);
            var txt = document.createTextNode(text);
            elmt.appendChild(txt);
            return elmt;
        },

        /**
        * @brief creates a <fieldset>
        *
        * @param legend: the legend of the fieldset
        * @param checkboxID: the ID of the checkbox on the left of the legend (if "", no checkbox will be created)
        *
        * @return the created fieldset
        */
        createFieldSet : function(legend, checkboxID = "") {
            var fieldset = document.createElement("fieldset");

            if(checkboxID == "") {
                fieldset.appendChild(this.createSimpleElement("legend", legend));
            } else {
                fieldset.appendChild(this.createInput("checkbox", legend, checkboxID, "legend"));
            }

            return fieldset;
        },

        createLabelFor : function(label, id) {
            var lbl = this.createSimpleElement("label", label);
            lbl.htmlFor = id;
            return lbl;
        },

        createInput : function(type, label, inputID, parentElementTag = "div") {
            var ret = document.createElement(parentElementTag);
            var ipt = document.createElement("input");
            ipt.type = type;
            ipt.id = inputID;
            ret.appendChild(ipt);

            ret.appendChild(this.createLabelFor(label, inputID));

            //TODO: listeners

            return ret;
        },

        settings : {
            setting : function(label, inputObj) {
                var container = document.createElement("div");
                container.appendChild(gui.createLabelFor(label + " :", inputObj.id));
                container.appendChild(inputObj);
                return container;
            },

            checkbox : function(id) {
                var ret = document.createElement("input");
                ret.type = "checkbox";
                ret.id = id;
                return ret;
            },

            combobox : function(values, id) {
                var ret = document.createElement("select");
                ret.id = id;

                for(var i in values) {
                    const val = values[i];
                    let opt = gui.createSimpleElement("option", val);
                    opt.value = val;

                    ret.appendChild(opt);
                }

                return ret;
            },

            text : function(id) {
                var ret = document.createElement("input");
                ret.type = "text";
                ret.id = id;

                return ret;
            }
        }
    };

    function showSettingsPanel() {
        var panel = document.getElementById(SETTINGS_PANEL_ID);
        panel.style.display = "block";
        panel.style.opacity = "1";
    }

    function createScriptButton(className) {
        var settingsButton = document.createElement("a");
        settingsButton.id = LIB + "_settingsButton";
        settingsButton.className = className;
        settingsButton.href = "#";

        var settingsButtonLabel = document.createTextNode("Scripts");
        settingsButton.appendChild(settingsButtonLabel);

        settingsButton.addEventListener("click", function(event) {
            event.preventDefault();
            showSettingsPanel();
        });

        return settingsButton;
    }

    function createShadingElement() {
        var shadingElement = document.createElement("div");
        shadingElement.className = "shading_element";
        return shadingElement;
    }

    const SETTING_BLOCK_CONTAINER_ID = SETTINGS_PANEL_ID + "_container";

    function getSettingsBlockContainer() {
        return document.getElementById(SETTING_BLOCK_CONTAINER_ID);
    }

    function createSettingsPanel() {
        var settingsPanel = document.createElement("dialog");
        settingsPanel.id = SETTING_BLOCK_CONTAINER_ID;

        var settingsPanelHeader = document.createElement("header");
        settingsPanelHeader.appendChild(gui.createSimpleElement("h1", "Paramètres des scripts HFRlib"));
        settingsPanel.appendChild((settingsPanelHeader));

        var mainSettings = gui.createFieldSet("Général");
        mainSettings.appendChild(createMainSettings());
        settingsPanel.appendChild(mainSettings);

        var cloudSettings = gui.createFieldSet("Sauvegarde cloud", "cloudStorage_checkbox");
        cloudSettings.appendChild(createCloudSettings());
        settingsPanel.appendChild(cloudSettings);

        //TODO: listeners
        //TODO: save and discard button

        return settingsPanel;
    }

    function createMainSettings() {
        var container = document.createElement("main");

        //TODO

        return container;
    }

    function createCloudSettings() {
        var container = document.createElement("main");

        //TODO

        return container;
    }

    function getOrCreateSettingsBlock(script, settings) {
        const settingsBlockID = LIB + "_settings_" + script.ID;

        var block = document.getElementById(settingsBlockID);
        if(block === null) {
            block = gui.createFieldSet(script.Name);
            block.id = settingsBlockID;

            getSettingsBlockContainer().appendChild(block);
        }

        return block;
    }

    //page functions
    function loadPage(url, anonymously = true, callback) {
        //TODO: handle anonymous requests
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            callback(parsePage(url, this.responseXML));
        }
        xhr.open("GET", url);
        xhr.responseType = "document";
        xhr.send();
    }

    function parsePage(url, doc) {
        var ret = {};
        ret.currentUrl = url;
        ret.doc = doc;

        detectPageType(doc, ret);
        if(ret.type == HFRlib.PageType.TopicList)
            parseTopicList(doc, ret);
        else if(ret.type == HFRlib.PageType.Topic)
            parseTopic(doc, ret);

        ret.load = function() {alert("loading (" + this.currentUrl + ")");};

        return ret;
    }

    function detectPageType(doc, ret) {
        if(doc.querySelectorAll("table.main > tbody > tr.fondForum1Description").length > 0) {
            ret.type = HFRlib.PageType.TopicList;
        } else if(doc.querySelectorAll("table.main > tbody > tr.fondForum2Title").length > 0) {
            ret.type = HFRlib.PageType.Topic;
        } else {
            ret.type = HFRlib.PageType.Undefined;
        }
    }

    function parseTopicList(doc, ret) {
        ret.topics = [];
        var topics = doc.querySelectorAll("table.main > tbody > tr.sujet");
        for(var i = 0; i < topics.length; ++i) {
            var tmp = parseTopicListTopic(topics[i]);
            //alert(tmp.auteur.get());
            alert(tmp.lastmessage.date.get());
            ret.topics.push(tmp);
        }
    }

    function parseTopicListTopic(root) {
        var ret = {};
        ret.dom = root;

        ret.title = {
            dom: root.querySelector("td.sujetCase3 > a.cCatTopic"),

            get: function(){return this.dom.textContent;},
            set: function(val){this.dom.textContent = val;},

            getUrl: function(){return this.dom.href;},
            setUrl: function(val){this.dom.href = val;}
        };

        ret.lastpage = {
            dom: root.querySelector("td.sujetCase4 > a.cCatTopic"),

            get: function(){return this.dom.textContent;},
            set: function(val){this.dom.textContent = val;},

            getUrl: function(){return this.dom.href;},
            setUrl: function(val){this.dom.href = val;}
        };

        ret.drapal = {
            dom: root.querySelector("td.sujetCase5 > a.cCatTopic")
            //TODO
        };

        if(root.querySelector("td.sujetCase6 > span") == null)
        {
            //auteur simple
            ret.authors = {
                dom: root.querySelector("td.sujetCase6 > a"),

                get: function(){return this.dom.textContent;},
                set: function(val){this.dom.textContent = val;},

                getUrl: function(){return this.dom.href;},
                setUrl: function(){this.dom.href = val;}
            }
        }
        else
        {
            //auteur multiple
            ret.authors = {
                dom: root.querySelector("td.sujetCase6 > span"),

                get: function(){return this.dom.title;},
                set: function(val){this.dom.title = val;}
            };
        }

        ret.answers = {
            dom: root.querySelector("td.sujetCase7"),

            get: function(){return this.dom.textContent;},
            set: function(val){this.dom.textContent = val;},

            lues: {
                dom: root.querySelector("td.sujetCase8"),

                get: function(){return this.dom.textContent;},
                set: function(val){this.dom.textContent = val;}
            }
        };

        ret.lastmessage = {
            dom: root.querySelector("td.sujetCase9 > a"),

            date: {
                //TODO
            },
            //TODO
        };

        return ret;
    }

    function parseTopic(doc, ret) {
        ret.title = {
            dom: doc.querySelector("tr.fondForum2Title > th > div > h3"),

            get: function(){return this.dom.textContent;},
            set: function(val){this.dom.textContent = val;}
        };

        ret.messages = [];
        var msgs = doc.querySelectorAll("table.messagetable > tbody > tr.message");
        for(var i = 0; i < msgs.length; ++i) {
            ret.messages.push(parseMessage(msgs[i]));
        }
    }

    function parseMessage(root) {
        var ret = {};
        ret.dom = root;

        ret.author = {
            dom: root.querySelector("td.messCase1 > div > b.s2"),

            get: function() {return this.dom.textContent;},
            set: function(val) {this.dom.textContent = val;}
        };

        ret.message = {
            dom: root.querySelector("td.messCase2 > div:not(.toolbar)"),

            signature: {
                dom: root.querySelector("td.messCase2 > div:not(.toolbar) > span.signature"),

                get: function() {
                    if(this.dom != null)
                        return this.dom.innerHTML;
                    else
                        return "";
                },
                set: function(val) {
                    if(this.dom != null)
                        this.dom.innerHTML = val;
                },

                getTag: function() {
                    if(this.dom != null)
                        return this.dom.outerHTML;
                    else
                        return "";
                }
            },

            getHTML: function() {
                var domHTML = this.dom.cloneNode(true);
                var sig = domHTML.querySelector("span.signature");
                if(sig != null)
                    domHTML.removeChild(sig);
                return domHTML.innerHTML;
            },
            setHTML: function(val) {
                var sig = this.signature.getTag();
                this.dom.innerHTML = val + sig;
            }
        };

        return ret;
    }

}(window.HFRlib = window.HFRlib || {}));
