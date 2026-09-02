package com.redwords.red_words

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class RedWordsWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val word = prefs.getString("word", "") ?: ""
        val citation = prefs.getString("citation", "") ?: ""
        for (id in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.red_words_widget)
            views.setTextViewText(R.id.word, word)
            views.setTextViewText(R.id.citation, citation)
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("redwords://today")).apply {
                setPackage(context.packageName)
            }
            val pending = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            views.setOnClickPendingIntent(R.id.word_card, pending)
            appWidgetManager.updateAppWidget(id, views)
        }
    }

    companion object {
        const val PREFS = "group.com.redwords.redWords"
    }
}
