package com.caprockapps.plugins.chromecast;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.mediarouter.media.MediaRouter;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.framework.Session;
import com.google.android.gms.cast.framework.media.RemoteMediaClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.List;

@CapacitorPlugin()
public class Chromecast extends Plugin {
    /**
     * Tag for logging.
     */
    private static final String TAG = "Chromecast";
    /**
     * Object to control the connection to the chromecast.
     */
    private ChromecastConnection connection;
    /**
     * Object to control the media.
     */
    private ChromecastSession media;
    /**
     * Holds the reference to the current client initiated scan.
     */
    private ChromecastConnection.ScanCallback clientScan;
    /**
     * Holds the reference to the current client initiated scan callback.
     */
    private PluginCall scanPluginCall;
    /**
     * Client's event listener callback.
     */
    private CallbackContext eventCallback;
    /**
     * In the case that chromecast can't be used.
     **/
    private String noChromecastError;

    public boolean execute(String action, JSONArray args, CallbackContext cbContext) throws JSONException {
        if (noChromecastError != null) {
            cbContext.error(ChromecastUtilities.createError("api_not_initialized", noChromecastError));
            return true;
        }
        try {
            Method[] list = this.getClass().getMethods();
            Method methodToExecute = null;
            for (Method method : list) {
                if (method.getName().equals(action)) {
                    Type[] types = method.getGenericParameterTypes();
                    // +1 is the cbContext
                    if (args.length() + 1 == types.length) {
                        boolean isValid = true;
                        for (int i = 0; i < args.length(); i++) {
                            // Handle null/undefined arguments
                            if (JSONObject.NULL.equals(args.get(i))) {
                                continue;
                            }
                            Class arg = args.get(i).getClass();
                            if (types[i] != arg) {
                                isValid = false;
                                break;
                            }
                        }
                        if (isValid) {
                            methodToExecute = method;
                            break;
                        }
                    }
                }
            }
            if (methodToExecute != null) {
                Type[] types = methodToExecute.getGenericParameterTypes();
                Object[] variableArgs = new Object[types.length];
                for (int i = 0; i < args.length(); i++) {
                    variableArgs[i] = args.get(i);
                    // Translate null JSONObject to null
                    if (JSONObject.NULL.equals(variableArgs[i])) {
                        variableArgs[i] = null;
                    }
                }
                variableArgs[variableArgs.length - 1] = cbContext;
                Class<?> r = methodToExecute.getReturnType();
                if (r == boolean.class) {
                    return (Boolean) methodToExecute.invoke(this, variableArgs);
                } else {
                    methodToExecute.invoke(this, variableArgs);
                    return true;
                }
            } else {
                return false;
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
            return false;
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return false;
        } catch (InvocationTargetException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Initialize all of the MediaRouter stuff with the AppId.
     * For now, ignore the autoJoinPolicy and defaultActionPolicy; those will come later
     *
     * @param pluginCall called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean initialize(final PluginCall pluginCall) {
        // The appId we're going to use for ALL session requests
        String appId = pluginCall.getString("appId");
        // tab_and_origin_scoped | origin_scoped | page_scoped
        String autoJoinPolicy = pluginCall.getString("autoJoinPolicy");
        // create_session | cast_this_tab
        String defaultActionPolicy = pluginCall.getString("defaultActionPolicy");

        setup();

        try {
            this.connection = new ChromecastConnection(getActivity(), new ChromecastConnection.Listener() {
                @Override
                public void onSessionStarted(Session session, String sessionId) {
                  try {
                    JSONObject result = new JSONObject();
                    result.put("isConnected",session.isConnected());
                    result.put("sessionId",sessionId);
                    sendEvent("SESSION_STARTED", JSObject.fromJSONObject(result));
                  } catch (JSONException e) {
                  }
                }


              @Override
              public void onSessionEnded(Session session, int error) {
                try {
                  JSONObject result = new JSONObject();
                  result.put("isConnected",session.isConnected());
                  result.put("error",error);
                  sendEvent("SESSION_ENDED", JSObject.fromJSONObject(result));
                } catch (JSONException e) {
                }
              }
              @Override
              public void onSessionEnding(Session session) {
              }
              @Override
              public void onSessionResumeFailed(Session session, int error) {
              }
              @Override
              public void onSessionResumed(Session session, boolean wasSuspended) {
                try {
                  JSONObject result = new JSONObject();
                  result.put("isConnected",session.isConnected());
                  result.put("wasSuspended",wasSuspended);
                  sendEvent("SESSION_RESUMED", JSObject.fromJSONObject(result));
                } catch (JSONException e) {
                }
              }
              @Override
              public void onSessionResuming(Session session, String sessionId) {
              }
              @Override
              public void onSessionStartFailed(Session session, int error) {
                try {
                  JSONObject result = new JSONObject();
                  result.put("isConnected",session.isConnected());
                  result.put("error",error);
                  sendEvent("SESSION_START_FAILED", JSObject.fromJSONObject(result));
                } catch (JSONException e) {
                }
              }
              @Override
              public void onSessionStarting(Session session) {
              }
              @Override
              public void onSessionSuspended(Session session, int reason) {
              }

                @Override
                public void onSessionRejoin(JSONObject jsonSession) {
                    try {
                        sendEvent("SESSION_LISTENER", JSObject.fromJSONObject(jsonSession));
                    } catch (JSONException e) {
                    }
                }

                @Override
                public void onSessionUpdate(JSONObject jsonSession) {
                    try {
                        sendEvent("SESSION_UPDATE", JSObject.fromJSONObject(jsonSession));
                    } catch (JSONException e) {
                    }
                }

                @Override
                public void onSessionEnd(JSONObject jsonSession) {
                    onSessionUpdate(jsonSession);
                }

                @Override
                public void onReceiverAvailableUpdate(boolean available) {
                    sendEvent("RECEIVER_LISTENER", new JSObject().put("isAvailable", available));
                }

                @Override
                public void onMediaLoaded(JSONObject jsonMedia) {
                    try {
                        sendEvent("MEDIA_LOAD", JSObject.fromJSONObject(jsonMedia));
                    } catch (JSONException e) {
                    }
                }

                @Override
                public void onMediaUpdate(JSONObject jsonMedia) {
//                    JSONArray out = new JSONArray();


                    // TODO: Fix null pointer exception
                    try {
                        if (jsonMedia != null) {
                            sendEvent("MEDIA_UPDATE", JSObject.fromJSONObject(jsonMedia));
                        }
                    } catch (JSONException e) {
                    }
                }

                @Override
                public void onMessageReceived(CastDevice device, String namespace, String message) {
                    sendEvent("RECEIVER_MESSAGE", new JSObject().put(device.getDeviceId(), new JSObject().put("namespace", namespace).put("message", message)));
                }
            });
            this.media = connection.getChromecastSession();
        } catch (RuntimeException e) {
            Log.e("tag", "Error initializing Chromecast connection: " + e.getMessage());
            noChromecastError = "Could not initialize chromecast: " + e.getMessage();
            e.printStackTrace();
        }

        connection.initialize(appId, pluginCall);
        return true;
    }

    /**
     * Request the session for the previously sent appId.
     * THIS IS WHAT LAUNCHES THE CHROMECAST PICKER
     * or, if we already have a session launch the connection options
     * dialog which will have the option to stop casting at minimum.
     *
     * @param pluginCall called with .success or .error depending on the result
     * @return true for capacitor
     */
    @PluginMethod
    public boolean requestSession(final PluginCall pluginCall) {
        connection.requestSession(new ChromecastConnection.RequestSessionCallback() {
            @Override
            public void onJoin(JSONObject jsonSession) {
                try {
                    pluginCall.resolve(JSObject.fromJSONObject(jsonSession));
                } catch (JSONException e) {
                    pluginCall.reject("json_parse_error", e);
                }
            }

            @Override
            public void onError(int errorCode) {
                // TODO maybe handle some of the error codes better
                pluginCall.reject("session_error");
            }

            @Override
            public void onCancel() {
                pluginCall.reject("cancel");
            }
        });
        return true;
    }

    /**
     * Selects a route by its id.
     *
     * @param pluginCall called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean selectRoute(final PluginCall pluginCall) {
        // the id of the route to join
        String routeId = pluginCall.getString("routeId");
        connection.selectRoute(routeId, new ChromecastConnection.SelectRouteCallback() {
            @Override
            public void onJoin(JSONObject jsonSession) {
                try {
                    pluginCall.resolve(JSObject.fromJSONObject(jsonSession));
                } catch (JSONException e) {
                    pluginCall.reject("json_parse_error", e);
                }
            }

            @Override
            public void onError(JSONObject message) {
                try {
                    pluginCall.resolve(JSObject.fromJSONObject(message));
                } catch (JSONException e) {
                    pluginCall.reject("json_parse_error", e);
                }
            }
        });
        return true;
    }

    /**
     * Set the volume level on the receiver - this is a Chromecast volume, not a Media volume.
     *
     * @param newLevel        the level to set the volume to
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean setReceiverVolumeLevel(Integer newLevel, CallbackContext callbackContext) {
        return this.setReceiverVolumeLevel(newLevel.doubleValue(), callbackContext);
    }

    /**
     * Set the volume level on the receiver - this is a Chromecast volume, not a Media volume.
     *
     * @param newLevel        the level to set the volume to
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean setReceiverVolumeLevel(Double newLevel, CallbackContext callbackContext) {
        this.media.setVolume(newLevel, callbackContext);
        return true;
    }

    /**
     * Sets the muted boolean on the receiver - this is a Chromecast mute, not a Media mute.
     *
     * @param muted           if true set the media to muted, else, unmute
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean setReceiverMuted(Boolean muted, CallbackContext callbackContext) {
        this.media.setMute(muted, callbackContext);
        return true;
    }

    /**
     * Send a custom message to the receiver - we don't need this just yet... it was just simple to implement on the js side.
     *
     * @param namespace       namespace
     * @param message         the message to send
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean sendMessage(final PluginCall pluginCall) {
      String namespace = pluginCall.getString("namespace");
      String message = pluginCall.getString("message");
      JSObject returnObj = new JSObject();
      returnObj.put("success",false);
      //If we don't have a session here we need to try and get it
      if(this.media == null) this.media = connection.getChromecastSession();
      //If we still don't have a session we can't call sendMessage return false;
      if(this.media == null){
        pluginCall.resolve(returnObj);
        return false;
      }
      this.media.sendMessage(namespace, message,new ResultCallback<Status>() {
        @Override
        public void onResult(Status result) {
          if (!result.isSuccess()) {
            returnObj.put("error",result.getStatus().toString());
          } else {
            returnObj.put("success",true);
          }
        }
      });
      pluginCall.resolve(returnObj);
      return true;
    }

    /**
     * Adds a listener to a specific namespace.
     *
     * @param namespace       namespace
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean addMessageListener(String namespace, CallbackContext callbackContext) {
        this.media.addMessageListener(namespace);
        callbackContext.success();
        return true;
    }

    /**
     * Loads some media on the Chromecast using the media APIs.
     *
     * @param contentId      The URL of the media item
     * @param customData     CustomData
     * @param contentType    MIME type of the content
     * @param duration       Duration of the content
     * @param streamType     buffered | live | other
     * @param autoPlay       Whether or not to automatically start playing the media
     * @param currentTime    Where to begin playing from
     * @param metadata       Metadata
     * @param textTrackStyle The text track style
     * @param pluginCall     called with .success or .error depending on the result
     */
    @PluginMethod
    public void loadMedia(final PluginCall pluginCall) {
        String contentId = pluginCall.getString("contentId");
        JSObject customData = pluginCall.getObject("customData", new JSObject());
        String contentType = pluginCall.getString("contentType", "");
        Integer duration = pluginCall.getInt("duration", 0);
        String streamType = pluginCall.getString("streamType", "");
        Boolean autoPlay = pluginCall.getBoolean("autoPlay", false);
        Integer currentTime = pluginCall.getInt("currentTime", 0);
        JSObject metadata = pluginCall.getObject("metadata", new JSObject());
        JSObject textTrackStyle = pluginCall.getObject("textTrackStyle", new JSObject());

        this.connection.getChromecastSession().loadMedia(contentId, customData, contentType, duration, streamType, autoPlay, currentTime, metadata, textTrackStyle, pluginCall);
    }

    /**
     * Play on the current media in the current session.
     *
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean mediaPlay(CallbackContext callbackContext) {
        media.mediaPlay(callbackContext);
        return true;
    }

    /**
     * Pause on the current media in the current session.
     *
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean mediaPause(CallbackContext callbackContext) {
        media.mediaPause(callbackContext);
        return true;
    }

    /**
     * Seeks the current media in the current session.
     *
     * @param seekTime        - Seconds to seek to
     * @param resumeState     - Resume state once seeking is complete: PLAYBACK_PAUSE or PLAYBACK_START
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean mediaSeek(Integer seekTime, String resumeState, CallbackContext callbackContext) {
        media.mediaSeek(seekTime.longValue() * 1000, resumeState, callbackContext);
        return true;
    }


    /**
     * Set the volume level and mute state on the media.
     *
     * @param level           the level to set the volume to
     * @param muted           if true set the media to muted, else, unmute
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean setMediaVolume(Integer level, Boolean muted, CallbackContext callbackContext) {
        return this.setMediaVolume(level.doubleValue(), muted, callbackContext);
    }

    /**
     * Set the volume level and mute state on the media.
     *
     * @param level           the level to set the volume to
     * @param muted           if true set the media to muted, else, unmute
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean setMediaVolume(Double level, Boolean muted, CallbackContext callbackContext) {
        media.mediaSetVolume(level, muted, callbackContext);
        return true;
    }

    /**
     * Stops the current media.
     *
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean mediaStop(CallbackContext callbackContext) {
        media.mediaStop(callbackContext);
        return true;
    }

    /**
     * Handle Track changes.
     *
     * @param activeTrackIds  track Ids to set.
     * @param textTrackStyle  text track style to set.
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean mediaEditTracksInfo(JSONArray activeTrackIds, JSONObject textTrackStyle, final CallbackContext callbackContext) {
        long[] trackIds = new long[activeTrackIds.length()];

        try {
            for (int i = 0; i < activeTrackIds.length(); i++) {
                trackIds[i] = activeTrackIds.getLong(i);
            }
        } catch (JSONException ignored) {
            LOG.e(TAG, "Wrong format in activeTrackIds");
        }

        this.media.mediaEditTracksInfo(trackIds, textTrackStyle, callbackContext);
        return true;
    }

    /**
     * Loads a queue of media to the Chromecast.
     *
     * @param queueLoadRequest chrome.cast.media.QueueLoadRequest
     * @param callbackContext  called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean queueLoad(JSONObject queueLoadRequest, final CallbackContext callbackContext) {
        this.media.queueLoad(queueLoadRequest, callbackContext);
        return true;
    }

    /**
     * Plays the item with itemId in the queue.
     *
     * @param itemId          The ID of the item to jump to.
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean queueJumpToItem(Integer itemId, final CallbackContext callbackContext) {
        this.media.queueJumpToItem(itemId, callbackContext);
        return true;
    }

    /**
     * Plays the item with itemId in the queue.
     *
     * @param itemId          The ID of the item to jump to.
     * @param callbackContext called with .success or .error depending on the result
     * @return true for cordova
     */
    public boolean queueJumpToItem(Double itemId, final CallbackContext callbackContext) {
        if (itemId - Double.valueOf(itemId).intValue() == 0) {
            // Only perform the jump if the double is a whole number
            return queueJumpToItem(Double.valueOf(itemId).intValue(), callbackContext);
        } else {
            return true;
        }
    }

    /**
     * Stops the session.
     *
     * @param pluginCall called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean sessionStop(PluginCall pluginCall) {
        connection.endSession(true, pluginCall);
        return true;
    }

    /**
     * Stops the session.
     *
     * @param pluginCall called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean sessionLeave(PluginCall pluginCall) {
        connection.endSession(false, pluginCall);
        return true;
    }

    /**
     * Will actively scan for routes and send a json array to the client.
     * It is super important that client calls "stopRouteScan", otherwise the
     * battery could drain quickly.
     *
     * @param pluginCall called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean startRouteScan(PluginCall pluginCall) {
        if (scanPluginCall != null) {

            scanPluginCall.reject("Started a new route scan before stopping previous one.");
//            scanPluginCall.reject(ChromecastUtilities.createError("cancel", "Started a new route scan before stopping previous one."));
        }
        scanPluginCall = pluginCall;
        Runnable startScan = new Runnable() {
            @Override
            public void run() {
                clientScan = new ChromecastConnection.ScanCallback() {
                    @Override
                    void onRouteUpdate(List<MediaRouter.RouteInfo> routes) {
                        if (scanPluginCall != null) {
                            PluginResult pluginResult = new PluginResult(PluginResult.Status.OK,
                                    ChromecastUtilities.createRoutesArray(routes));
                            pluginResult.setKeepCallback(true);

                            JSObject ret = new JSObject();
                            JSArray retArr = new JSArray();

                            for (int i = 0; i < routes.size(); i++) {
                                retArr.put(routes.get(i));
                            }
                            ret.put("routes", retArr);

                            scanPluginCall.resolve(ret);
                        } else {
                            // Try to get the scan to stop because we already ended the scanCallback
                            connection.stopRouteScan(clientScan, null);
                        }
                    }
                };
                connection.startRouteScan(null, clientScan, null);
            }
        };
        if (clientScan != null) {
            // Stop any other existing clientScan
            connection.stopRouteScan(clientScan, startScan);
        } else {
            startScan.run();
        }
        return true;
    }

    /**
     * Stops the scan started by startRouteScan.
     *
     * @param pluginCall called with .success or .error depending on the result
     * @return true for cordova
     */
    @PluginMethod
    public boolean stopRouteScan(final PluginCall pluginCall) {
        // Stop any other existing clientScan
        connection.stopRouteScan(clientScan, new Runnable() {
            @Override
            public void run() {
                if (scanPluginCall != null) {
                    scanPluginCall.reject("Scan stopped.");
                    scanPluginCall = null;
                }
                pluginCall.resolve();
            }
        });
        return true;
    }

    /**
     * Do everything you need to for "setup" - calling back sets the isAvailable and lets every function on the
     * javascript side actually do stuff.
     *
     * @return true for cordova
     */
    private boolean setup() {
        if (this.connection != null) {
            connection.stopRouteScan(clientScan, new Runnable() {
                @Override
                public void run() {
                    if (scanPluginCall != null) {
                        scanPluginCall.reject("Scan stopped because setup triggered.");
                        scanPluginCall = null;
                    }
                    sendEvent("SETUP", new JSObject());
                }
            });
        }

        return true;
    }

    /**
     * This triggers an event on the JS-side.
     *
     * @param eventName - The name of the JS event to trigger
     * @param args      - The arguments to pass the JS event
     */
    private void sendEvent(String eventName, JSObject args) {
        notifyListeners(eventName, args);
    }
}
