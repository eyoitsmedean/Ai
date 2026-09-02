package com.redwords.red_words

import android.appwidget.AppWidgetManager
import android.content.ComponentName
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
            getSharedPreferences(RedWordsWidget.PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString("word", word)
                .putString("citation", citation)
                .apply()
            val manager = AppWidgetManager.getInstance(this)
            val ids = manager.getAppWidgetIds(ComponentName(this, RedWordsWidget::class.java))
            if (ids.isNotEmpty()) {
                val update = Intent(this, RedWordsWidget::class.java).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
                update.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                sendBroadcast(update)
            }
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
                "initial" -> result.success(initialLink)
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
