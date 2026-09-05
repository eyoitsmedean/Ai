package com.redwords.red_words

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONArray
import java.util.Calendar

/** One Word-only card: the saying and its address. */
data class WordSlot(val word: String, val citation: String)

class RedWordsWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        val slot = slotFor(context, System.currentTimeMillis())
        for (id in appWidgetIds) {
            appWidgetManager.updateAppWidget(id, render(context, slot))
        }
        scheduleMidnight(context)
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        scheduleMidnight(context)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        alarmManager(context).cancel(midnightIntent(context))
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_MIDNIGHT) {
            refreshAll(context)
        }
    }

    companion object {
        const val PREFS = "group.com.redwords.redWords"
        const val ACTION_MIDNIGHT = "com.redwords.red_words.MIDNIGHT"
        private const val DAY_MS = 86400000L

        /**
         * Same clock as Dart `dailyIndexFor` and Node `dailyForDate`:
         * floor(epochMs(local midnight) / 86400000) mod length.
         */
        fun slotIndex(nowMs: Long, length: Int, calendar: Calendar = Calendar.getInstance()): Int {
            if (length <= 0) return 0
            calendar.timeInMillis = nowMs
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            val day = Math.floorDiv(calendar.timeInMillis, DAY_MS)
            return Math.floorMod(day, length.toLong()).toInt()
        }

        fun rotation(context: Context): List<WordSlot> {
            val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString("rotation", null) ?: return emptyList()
            return try {
                val array = JSONArray(raw)
                (0 until array.length()).mapNotNull { i ->
                    val item = array.optJSONObject(i) ?: return@mapNotNull null
                    val word = item.optString("word", "")
                    val citation = item.optString("citation", "")
                    if (word.isEmpty() || citation.isEmpty()) null else WordSlot(word, citation)
                }
            } catch (e: Exception) {
                emptyList()
            }
        }

        fun slotFor(context: Context, nowMs: Long): WordSlot {
            val slots = rotation(context)
            if (slots.isEmpty()) {
                val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                return WordSlot(
                    prefs.getString("word", "") ?: "",
                    prefs.getString("citation", "") ?: "",
                )
            }
            return slots[slotIndex(nowMs, slots.size)]
        }

        fun render(context: Context, slot: WordSlot): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.red_words_widget)
            views.setTextViewText(R.id.word, slot.word)
            views.setTextViewText(R.id.citation, slot.citation)
            val open = Intent(Intent.ACTION_VIEW, Uri.parse("redwords://today")).apply {
                setPackage(context.packageName)
            }
            val pending = PendingIntent.getActivity(
                context,
                0,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            views.setOnClickPendingIntent(R.id.word_card, pending)
            return views
        }

        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, RedWordsWidget::class.java))
            if (ids.isEmpty()) return
            val slot = slotFor(context, System.currentTimeMillis())
            for (id in ids) {
                manager.updateAppWidget(id, render(context, slot))
            }
            scheduleMidnight(context)
        }

        private fun alarmManager(context: Context) =
            context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        private fun midnightIntent(context: Context): PendingIntent {
            val intent = Intent(context, RedWordsWidget::class.java).setAction(ACTION_MIDNIGHT)
            return PendingIntent.getBroadcast(
                context,
                1,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        /**
         * Inexact wake shortly after the next local midnight. No exact-alarm
         * permission; `updatePeriodMillis` remains the 30-minute safety net.
         */
        fun scheduleMidnight(context: Context) {
            val next = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 30)
                set(Calendar.MILLISECOND, 0)
                add(Calendar.DAY_OF_YEAR, 1)
            }
            alarmManager(context).setAndAllowWhileIdle(
                AlarmManager.RTC,
                next.timeInMillis,
                midnightIntent(context),
            )
        }
    }
}
