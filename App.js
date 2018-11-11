import React, { Component } from "react";
import { SafeAreaView, Alert, Linking } from "react-native";
import { WebView } from "react-native-webview";

export default class App extends Component {
  onMessage(e) {
    // retrieve event data
    var data = e.nativeEvent.data;
    console.log({ data });
    // maybe parse stringified JSON
    try {
      data = JSON.parse(data);
    } catch (e) {}
    // check if this message concerns us
    if ("object" == typeof data && data.external_url_open) {
      // proceed with URL open request
      return Alert.alert(
        "External URL",
        "Do you want to open this URL in your browser?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => Linking.openURL(data.external_url_open) }
        ],
        { cancelable: false }
      );
    }
  }

  openExternalLink(req) {
    const isPatientAider = req.url.search("https://patientaider.org") !== -1;
    const isBlank = req.url.search("about:blank") !== -1;

    if (isPatientAider || isBlank) {
      return true;
    } else {
      Linking.openURL(req.url);
      return false;
    }
  }

  render() {
    let jsCode = `function injectedJavaScript(){window.alert('test'); var e=function(e,n,t){if(n=n.replace(/^on/g,""),"addEventListener"in window)e.addEventListener(n,t,!1);else if("attachEvent"in window)e.attachEvent("on"+n,t);else{var i=e["on"+n];e["on"+n]=i?function(e){i(e),t(e)}:t}return e},n=document.querySelectorAll("a[href]");if(n)for(var t in n)n.hasOwnProperty(t)&&e(n[t],"onclick",function(e){new RegExp("^https?://"+location.host,"gi").test(this.href)||(e.preventDefault(),window.postMessage(JSON.stringify({external_url_open:this.href})))})}injectedJavaScript();`;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <WebView
          // onError={console.error.bind(console, "error")}
          javaScriptEnabled={true}
          // onMessage={this.onMessage}
          injectedJavaScript={jsCode}
          // onShouldStartLoadWithRequest={this.openExternalLink}
          source={{ uri: "https://patientaider.org/" }}
        />
      </SafeAreaView>
    );
  }
}
