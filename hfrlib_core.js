/**
 * @file hfrlib_core.js
 * @brief core components of the HFRlib
 * @author n0m1s
 * @version 0.0.1
 * @date 2018-01-01
 */

(function(HFRlib, undefined) {

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

}(window.HFRlib = window.HFRlib || {}));
