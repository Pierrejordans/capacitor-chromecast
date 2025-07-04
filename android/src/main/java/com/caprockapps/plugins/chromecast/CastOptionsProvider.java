package com.caprockapps.plugins.chromecast;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.android.gms.cast.framework.CastOptions;
import com.google.android.gms.cast.framework.OptionsProvider;
import com.google.android.gms.cast.framework.SessionProvider;

import java.util.List;

public class CastOptionsProvider implements OptionsProvider {
    @Override
    public CastOptions getCastOptions(Context context) {
        // Version simple pour diagnostic - utilise uniquement la valeur statique
        String staticAppId = context.getString(R.string.app_id);
        android.util.Log.d("CastOptionsProvider", "Using STATIC App ID: " + staticAppId);
        
        // Essayer aussi de lire les SharedPreferences pour comparaison
        try {
            SharedPreferences prefs = context.getSharedPreferences("CHROMECAST_SETTINGS", Context.MODE_PRIVATE);
            String dynamicAppId = prefs.getString("appId", "NOT_SET");
            android.util.Log.d("CastOptionsProvider", "SharedPreferences App ID: " + dynamicAppId);
        } catch (Exception e) {
            android.util.Log.e("CastOptionsProvider", "Error reading SharedPreferences: " + e.getMessage());
        }
        
        CastOptions castOptions = new CastOptions.Builder()
            .setReceiverApplicationId(staticAppId)
            .build();
        return castOptions;
    }
    
    @Override
    public List<SessionProvider> getAdditionalSessionProviders(Context context) {
        return null;
    }
}