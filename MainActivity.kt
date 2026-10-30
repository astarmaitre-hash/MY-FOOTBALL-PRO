package com.myfootballpro.app

import android.app.Activity
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.webViewClient = WebViewClient()
        web.webChromeClient = WebChromeClient()
        web.loadUrl("file:///android_asset/index.html")
        setContentView(web)
    }
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val web = (window.decorView.findViewById(android.R.id.content) as? android.view.ViewGroup)
        val child = web?.getChildAt(0) as? WebView
        if (child?.canGoBack() == true) child.goBack() else super.onBackPressed()
    }
}
