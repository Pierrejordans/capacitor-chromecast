package com.universalreceiver

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.leanback.app.VideoSupportFragment
import androidx.leanback.app.VideoSupportFragmentGlueHost
import androidx.leanback.media.MediaPlayerAdapter
import androidx.leanback.media.PlaybackTransportControlGlue
import androidx.leanback.widget.PlaybackControlsRow
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.source.hls.HlsMediaSource
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import com.google.android.exoplayer2.upstream.DefaultHttpDataSource
import com.google.android.exoplayer2.upstream.HttpDataSource
import com.google.android.exoplayer2.util.Util
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.URLDecoder

class MainActivity : Activity() {
    
    private lateinit var videoFragment: VideoSupportFragment
    private lateinit var player: ExoPlayer
    private lateinit var statusText: TextView
    private lateinit var debugText: TextView
    
    private var currentAuthToken: String? = null
    private var streamUrl: String? = null
    private var streamTitle: String? = null
    
    companion object {
        private const val TAG = "UniversalReceiver"
        private const val INTENT_EXTRA_STREAM_URL = "stream_url"
        private const val INTENT_EXTRA_AUTH_TOKEN = "auth_token"
        private const val INTENT_EXTRA_STREAM_TITLE = "stream_title"
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        log("🚀 Démarrage du récepteur universel Android TV")
        
        // Initialiser les vues
        initializeViews()
        
        // Initialiser le player
        initializePlayer()
        
        // Traiter l'intent
        handleIntent(intent)
        
        // Configurer l'interface
        setupUI()
        
        log("✅ Application Android TV initialisée")
        updateStatus("Récepteur Android TV prêt", "idle")
    }
    
    private fun initializeViews() {
        statusText = findViewById(R.id.status_text)
        debugText = findViewById(R.id.debug_text)
        
        videoFragment = VideoSupportFragment()
        fragmentManager.beginTransaction()
            .replace(R.id.video_fragment_container, videoFragment)
            .commit()
    }
    
    private fun initializePlayer() {
        log("🎬 Initialisation du player ExoPlayer...")
        
        // Configuration du player avec support des headers personnalisés
        val httpDataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent(Util.getUserAgent(this, "UniversalReceiver"))
            .setAllowCrossProtocolRedirects(true)
            .setConnectTimeoutMs(30000)
            .setReadTimeoutMs(30000)
        
        player = ExoPlayer.Builder(this)
            .build()
        
        // Configuration du fragment vidéo
        val glueHost = VideoSupportFragmentGlueHost(videoFragment)
        val playerAdapter = MediaPlayerAdapter(this)
        val glue = PlaybackTransportControlGlue(this, playerAdapter)
        
        glue.host = glueHost
        glue.isSeekEnabled = true
        glue.isControlsOverlayAutoHideEnabled = true
        
        // Événements du player
        player.addListener(object : com.google.android.exoplayer2.Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                when (playbackState) {
                    com.google.android.exoplayer2.Player.STATE_IDLE -> {
                        log("⏹️ Player en veille")
                        updateStatus("En attente", "idle")
                    }
                    com.google.android.exoplayer2.Player.STATE_BUFFERING -> {
                        log("⏳ Mise en mémoire tampon...")
                        updateStatus("Mise en mémoire tampon...", "buffering")
                    }
                    com.google.android.exoplayer2.Player.STATE_READY -> {
                        log("✅ Prêt à jouer")
                        updateStatus("Prêt à jouer", "ready")
                    }
                    com.google.android.exoplayer2.Player.STATE_ENDED -> {
                        log("🏁 Fin de la lecture")
                        updateStatus("Lecture terminée", "ended")
                    }
                }
            }
            
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                if (isPlaying) {
                    log("▶️ Lecture en cours")
                    updateStatus("Lecture en cours", "playing")
                } else {
                    log("⏸️ Pause")
                    updateStatus("En pause", "paused")
                }
            }
            
            override fun onPlayerError(error: com.google.android.exoplayer2.PlaybackException) {
                log("❌ Erreur du player: ${error.message}")
                updateStatus("Erreur de lecture", "error")
                Toast.makeText(this@MainActivity, "Erreur de lecture: ${error.message}", Toast.LENGTH_LONG).show()
            }
        })
        
        log("✅ Player ExoPlayer initialisé")
    }
    
    private fun handleIntent(intent: Intent?) {
        if (intent == null) return
        
        log("📨 Traitement de l'intent...")
        
        // Vérifier si c'est un intent de streaming
        when (intent.action) {
            Intent.ACTION_VIEW -> {
                val uri = intent.data
                if (uri != null) {
                    log("🔗 URI reçu: $uri")
                    parseStreamUri(uri)
                }
            }
            "com.universalreceiver.LOAD_STREAM" -> {
                streamUrl = intent.getStringExtra(INTENT_EXTRA_STREAM_URL)
                currentAuthToken = intent.getStringExtra(INTENT_EXTRA_AUTH_TOKEN)
                streamTitle = intent.getStringExtra(INTENT_EXTRA_STREAM_TITLE)
                
                log("🎬 Stream depuis intent: $streamUrl")
                if (currentAuthToken != null) {
                    log("🔑 Token d'authentification fourni")
                }
                
                loadStream()
            }
        }
        
        // Vérifier les extras
        intent.extras?.let { extras ->
            for (key in extras.keySet()) {
                val value = extras.get(key)
                log("📝 Extra: $key = $value")
            }
        }
    }
    
    private fun parseStreamUri(uri: Uri) {
        streamUrl = uri.toString()
        
        // Extraire le token de l'URL
        val token = uri.getQueryParameter("token")
        if (token != null) {
            currentAuthToken = token
            log("🔑 Token extrait de l'URI: ${token.take(10)}...")
        }
        
        // Extraire le titre
        val title = uri.getQueryParameter("title")
        if (title != null) {
            streamTitle = URLDecoder.decode(title, "UTF-8")
            log("📝 Titre extrait: $streamTitle")
        }
        
        loadStream()
    }
    
    private fun loadStream() {
        val url = streamUrl
        if (url == null) {
            log("❌ Aucune URL de stream fournie")
            return
        }
        
        log("🎬 Chargement du stream: $url")
        updateStatus("Chargement du stream...", "loading")
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                // Configurer la source de données avec authentification
                val httpDataSourceFactory = createAuthenticatedDataSourceFactory()
                
                // Créer la source média
                val mediaSource = if (url.contains(".m3u8")) {
                    log("🎥 Création de la source HLS")
                    HlsMediaSource.Factory(httpDataSourceFactory)
                        .createMediaSource(MediaItem.fromUri(url))
                } else {
                    log("🎥 Création de la source média progressive")
                    com.google.android.exoplayer2.source.ProgressiveMediaSource.Factory(httpDataSourceFactory)
                        .createMediaSource(MediaItem.fromUri(url))
                }
                
                // Configurer le player
                player.setMediaSource(mediaSource)
                player.prepare()
                player.playWhenReady = true
                
                log("✅ Stream configuré avec succès")
                updateStatus("Stream configuré", "ready")
                
                // Mettre à jour l'interface
                updateStreamInfo()
                
            } catch (e: Exception) {
                log("❌ Erreur lors du chargement: ${e.message}")
                updateStatus("Erreur de chargement", "error")
                Toast.makeText(this@MainActivity, "Erreur: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    private fun createAuthenticatedDataSourceFactory(): HttpDataSource.Factory {
        val factory = DefaultHttpDataSource.Factory()
            .setUserAgent(Util.getUserAgent(this, "UniversalReceiver"))
            .setAllowCrossProtocolRedirects(true)
            .setConnectTimeoutMs(30000)
            .setReadTimeoutMs(30000)
        
        // Ajouter le token d'authentification si présent
        currentAuthToken?.let { token ->
            log("🔑 Configuration de l'authentification HTTP")
            
            // Plusieurs méthodes d'authentification possibles
            val headers = mutableMapOf<String, String>()
            
            // Méthode 1: Header Authorization
            headers["Authorization"] = "Bearer $token"
            
            // Méthode 2: Token personnalisé
            headers["X-Auth-Token"] = token
            
            // Méthode 3: User-Agent avec token
            headers["User-Agent"] = "${Util.getUserAgent(this, "UniversalReceiver")} Token/$token"
            
            factory.setDefaultRequestProperties(headers)
        }
        
        return factory
    }
    
    private fun updateStreamInfo() {
        val info = StringBuilder()
        
        streamTitle?.let { title ->
            info.append("Titre: $title\n")
        }
        
        streamUrl?.let { url ->
            info.append("URL: ${url.take(50)}...\n")
        }
        
        currentAuthToken?.let { token ->
            info.append("Token: ${token.take(10)}...\n")
        }
        
        // Informations sur le média
        val duration = player.duration
        if (duration > 0) {
            info.append("Durée: ${formatTime(duration)}\n")
        }
        
        val format = player.videoFormat
        format?.let {
            info.append("Résolution: ${it.width}x${it.height}\n")
            info.append("Bitrate: ${it.bitrate / 1000} kbps\n")
        }
        
        runOnUiThread {
            findViewById<TextView>(R.id.stream_info).text = info.toString()
        }
    }
    
    private fun setupUI() {
        // Configuration des contrôles TV
        videoFragment.view?.isFocusable = true
        videoFragment.view?.requestFocus()
        
        // Messages d'aide
        findViewById<TextView>(R.id.help_text).text = """
            📺 Récepteur Universel Android TV
            
            Commandes:
            • PLAY/PAUSE : Lecture/Pause
            • ← → : Avance/Recule 10s
            • ↑ ↓ : Volume +/-
            • MENU : Afficher les contrôles
            • BACK : Retour
            
            Support:
            • Flux HLS (.m3u8)
            • Authentification par token
            • Contrôles télécommande
        """.trimIndent()
    }
    
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER,
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                if (player.isPlaying) {
                    player.pause()
                } else {
                    player.play()
                }
                return true
            }
            KeyEvent.KEYCODE_MEDIA_PLAY -> {
                player.play()
                return true
            }
            KeyEvent.KEYCODE_MEDIA_PAUSE -> {
                player.pause()
                return true
            }
            KeyEvent.KEYCODE_MEDIA_FAST_FORWARD,
            KeyEvent.KEYCODE_DPAD_RIGHT -> {
                seekRelative(10000) // 10 secondes
                return true
            }
            KeyEvent.KEYCODE_MEDIA_REWIND,
            KeyEvent.KEYCODE_DPAD_LEFT -> {
                seekRelative(-10000) // -10 secondes
                return true
            }
            KeyEvent.KEYCODE_VOLUME_UP,
            KeyEvent.KEYCODE_DPAD_UP -> {
                adjustVolume(0.1f)
                return true
            }
            KeyEvent.KEYCODE_VOLUME_DOWN,
            KeyEvent.KEYCODE_DPAD_DOWN -> {
                adjustVolume(-0.1f)
                return true
            }
            KeyEvent.KEYCODE_MENU -> {
                showControls()
                return true
            }
        }
        
        return super.onKeyDown(keyCode, event)
    }
    
    private fun seekRelative(milliseconds: Long) {
        val currentPosition = player.currentPosition
        val newPosition = (currentPosition + milliseconds).coerceIn(0, player.duration)
        player.seekTo(newPosition)
        
        log("⏩ Seek: ${formatTime(newPosition)}")
        Toast.makeText(this, "Position: ${formatTime(newPosition)}", Toast.LENGTH_SHORT).show()
    }
    
    private fun adjustVolume(delta: Float) {
        val currentVolume = player.volume
        val newVolume = (currentVolume + delta).coerceIn(0f, 1f)
        player.volume = newVolume
        
        log("🔊 Volume: ${(newVolume * 100).toInt()}%")
        Toast.makeText(this, "Volume: ${(newVolume * 100).toInt()}%", Toast.LENGTH_SHORT).show()
    }
    
    private fun showControls() {
        // Afficher les contrôles de lecture
        videoFragment.view?.let { view ->
            view.visibility = View.VISIBLE
            view.requestFocus()
        }
    }
    
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        log("📨 Nouvel intent reçu")
        handleIntent(intent)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        log("🛑 Destruction de l'activité")
        player.release()
    }
    
    override fun onPause() {
        super.onPause()
        log("⏸️ Application en pause")
        player.pause()
    }
    
    override fun onResume() {
        super.onResume()
        log("▶️ Application reprise")
        
        // Reprendre la lecture si elle était en cours
        if (player.playbackState == com.google.android.exoplayer2.Player.STATE_READY) {
            player.play()
        }
    }
    
    // Fonctions utilitaires
    private fun log(message: String) {
        Log.d(TAG, message)
        
        // Mettre à jour l'affichage debug
        runOnUiThread {
            val currentText = debugText.text.toString()
            val newText = "$message\n$currentText"
                .split("\n")
                .take(20) // Garder seulement les 20 dernières lignes
                .joinToString("\n")
            
            debugText.text = newText
        }
    }
    
    private fun updateStatus(status: String, type: String) {
        runOnUiThread {
            statusText.text = status
            
            // Changer la couleur selon le type
            val color = when (type) {
                "playing" -> android.R.color.holo_green_light
                "buffering" -> android.R.color.holo_orange_light
                "error" -> android.R.color.holo_red_light
                else -> android.R.color.white
            }
            
            statusText.setTextColor(resources.getColor(color, null))
        }
    }
    
    private fun formatTime(milliseconds: Long): String {
        val seconds = milliseconds / 1000
        val hours = seconds / 3600
        val minutes = (seconds % 3600) / 60
        val secs = seconds % 60
        
        return if (hours > 0) {
            String.format("%d:%02d:%02d", hours, minutes, secs)
        } else {
            String.format("%d:%02d", minutes, secs)
        }
    }
} 