package com.redwords.red_words

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, SayingWidgetProvider.CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "update" -> {
                        val args = call.arguments as? Map<*, *>
                        if (args == null) {
                            result.error("args", "update expects a map", null)
                        } else {
                            storeAndRefresh(args)
                            result.success(null)
                        }
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun storeAndRefresh(args: Map<*, *>) {
        val prefs = getSharedPreferences(SayingWidgetProvider.PREFS, Context.MODE_PRIVATE)
        val editor = prefs.edit()
        for (key in SayingWidgetProvider.KEYS) {
            (args[key] as? String)?.let { editor.putString(key, it) }
        }
        editor.commit()

        val manager = AppWidgetManager.getInstance(this)
        val ids = manager.getAppWidgetIds(ComponentName(this, SayingWidgetProvider::class.java))
        if (ids.isEmpty()) return
        val refresh =
            Intent(this, SayingWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            }
        sendBroadcast(refresh)
    }
}
