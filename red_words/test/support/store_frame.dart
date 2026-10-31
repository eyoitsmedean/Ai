import 'package:flutter/material.dart';
import 'package:red_words/brand.dart';

/// Thin phone chrome so store shots read as a device, not a floating card.
class StoreFrame extends StatelessWidget {
  const StoreFrame({
    super.key,
    required this.child,
    this.phoneChrome = true,
  });

  final Widget child;
  final bool phoneChrome;

  @override
  Widget build(BuildContext context) {
    if (!phoneChrome) return child;
    return ColoredBox(
      color: Brand.charcoal,
      child: Column(
        children: [
          const _StatusBar(),
          Expanded(
            child: MediaQuery(
              data: MediaQuery.of(context).copyWith(
                padding: const EdgeInsets.only(top: 0, bottom: 20),
                viewPadding: const EdgeInsets.only(bottom: 20),
              ),
              child: child,
            ),
          ),
          const _HomeIndicator(),
        ],
      ),
    );
  }
}

class _StatusBar extends StatelessWidget {
  const _StatusBar();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 44,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            Text(
              '9:41',
              style: TextStyle(
                color: Brand.paper,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
            Spacer(),
            Icon(Icons.signal_cellular_alt, size: 16, color: Brand.paper),
            SizedBox(width: 6),
            Icon(Icons.wifi, size: 16, color: Brand.paper),
            SizedBox(width: 6),
            Icon(Icons.battery_full, size: 16, color: Brand.paper),
          ],
        ),
      ),
    );
  }
}

class _HomeIndicator extends StatelessWidget {
  const _HomeIndicator();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 20,
      child: Center(
        child: Container(
          width: 120,
          height: 4,
          decoration: BoxDecoration(
            color: Brand.paper.withValues(alpha: 0.35),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ),
    );
  }
}

/// Home-screen poster matching `saying_widget.xml`: Word, citation, thread.
class HomeWidgetPoster extends StatelessWidget {
  const HomeWidgetPoster({
    super.key,
    required this.word,
    required this.citation,
  });

  final String word;
  final String citation;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: const Color(0xFF3A322C),
      child: Stack(
        children: [
          const Positioned(
            left: 20,
            top: 18,
            child: Text(
              '9:41',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ),
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 320, maxHeight: 220),
              child: Material(
                color: Brand.paper,
                elevation: 2,
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        word,
                        maxLines: 5,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'serif',
                          fontSize: 16,
                          height: 1.35,
                          color: Brand.crimson,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        citation.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 11,
                          letterSpacing: 1.3,
                          color: Brand.crimson,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        key: const Key('widget-thread'),
                        width: 28,
                        height: 2,
                        color: Brand.crimson,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
