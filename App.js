import React, { Component } from "react";
import { SafeAreaView, Alert, Linking } from "react-native";
import { WebView } from "react-native-webview";

let jsCode = `(function() {
  var attachEvent = function(elem, event, callback) {
    event = event.replace(/^on/g, "");
    if ("addEventListener" in window) {
      elem.addEventListener(event, callback, false);
    } else if ("attachEvent" in window) {
      elem.attachEvent("on" + event, callback);
    } else {
      var registered = elem["on" + event];
      elem["on" + event] = registered
        ? function(e) {
            registered(e);
            callback(e);
          }
        : callback;
    }

    return elem;
  };
  var all_links = document.querySelectorAll("a[href]");
  if (all_links) {
    for (var i in all_links) {
      if (all_links.hasOwnProperty(i)) {
        attachEvent(all_links[i], "onclick", function(e) {
          if (!new RegExp("^https?://" + location.host, "gi").test(this.href)) {
            // handle external URL
            e.preventDefault();
            window.postMessage(
              JSON.stringify({
                external_url_open: this.href
              })
            );
          }
        });
      }
    }
  }
})()`;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.handleMessage = this.handleMessage.bind(this);
  }

  handleMessage(e) {
    // retrieve event data
    var data = e.nativeEvent.data;
    // maybe parse stringified JSON
    try {
      data = JSON.parse(data);
    } catch (e) {}
    // check if this message concerns us
    if (typeof data === "object" && data.external_url_open) {
      // proceed with URL open request
      return Alert.alert(
        "External URL",
        "Do you want to open this URL in your browser?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "OK",
            onPress: () => Linking.openURL(data.external_url_open)
          }
        ],
        { cancelable: false }
      );
    }

    if (
      typeof data === "object" &&
      data.componentDidMount &&
      data.componentDidMount === "Topic"
    ) {
      this.webView.injectJavaScript(jsCode);
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <WebView
          ref={c => {
            this.webView = c;
          }}
          javaScriptEnabled
          onMessage={this.handleMessage}
          injectedJavaScript={jsCode}
          source={{ uri: "https://patientaider.org/" }}
        />
      </SafeAreaView>
    );
  }
}
