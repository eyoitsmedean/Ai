package com.redwords.red_words

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class SayingWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        val word = prefs.getString("flutter.widget.word", "His words, for this moment")
        val citation = prefs.getString("flutter.widget.citation", "")
        val launch =
            Intent(context, MainActivity::class.java).apply {
                data = Uri.parse("redwords://today")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        val pending =
            PendingIntent.getActivity(
                context,
                0,
                launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        for (id in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.saying_widget)
            views.setTextViewText(R.id.widget_word, word)
            views.setTextViewText(R.id.widget_citation, citation)
            views.setOnClickPendingIntent(R.id.widget_root, pending)
            appWidgetManager.updateAppWidget(id, views)
        }
    }
}
