package fr.vard.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable persistent cookies in WebView
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(getBridge().getWebView(), true);

        // Enable DOM storage for session persistence
        WebSettings webSettings = getBridge().getWebView().getSettings();
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
    }

    @Override
    public void onPause() {
        super.onPause();
        // Flush cookies to disk when app goes to background
        CookieManager.getInstance().flush();
    }
}
