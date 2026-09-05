package com.redwords.red_words

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private var initialLink: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        initialLink = intent?.data?.toString()
        super.onCreate(savedInstanceState)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        initialLink = intent.data?.toString()
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        val messenger = flutterEngine.dartExecutor.binaryMessenger

        MethodChannel(messenger, "redwords/widget").setMethodCallHandler { call, result ->
            if (call.method != "sync") {
                result.notImplemented()
                return@setMethodCallHandler
            }
            val word = call.argument<String>("word") ?: ""
            val citation = call.argument<String>("citation") ?: ""
            val rotation = call.argument<String>("rotation")
            val editor = getSharedPreferences(RedWordsWidget.PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString("word", word)
                .putString("citation", citation)
            if (rotation != null) {
                editor.putString("rotation", rotation)
            }
            editor.apply()
            RedWordsWidget.refreshAll(this)
            result.success(null)
        }

        MethodChannel(messenger, "redwords/session").setMethodCallHandler { call, result ->
            val prefs = getSharedPreferences("red_words_session", Context.MODE_PRIVATE)
            when (call.method) {
                "hasOpened" -> result.success(prefs.getBoolean("hasOpened", false))
                "markOpened" -> {
                    prefs.edit().putBoolean("hasOpened", true).apply()
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }

        MethodChannel(messenger, "redwords/links").setMethodCallHandler { call, result ->
            when (call.method) {
                "initial" -> {
                    // Consume: a widget tap routes once, then the slate is clean.
                    val link = initialLink
                    initialLink = null
                    result.success(link)
                }
                "tel" -> {
                    val number = call.arguments as? String
                    if (!number.isNullOrBlank()) {
                        startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")))
                    }
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }
}
