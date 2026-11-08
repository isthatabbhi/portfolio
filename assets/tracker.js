/*
 * Activity 2 - Azure Analytics Tracker (test copy)
 * Sends anonymous usage events from the portfolio to the Azure Function
 * endpoint, which stores them in Azure Table Storage. The visitor id is
 * a random value kept in this browser only. Each event also carries the
 * device type detected from this browser (Desktop, Mobile or Tablet)
 * and the endpoint records the request IP so the dashboard can show
 * Top client IPs.
 */
(function () {
    'use strict';

    var TRACK_URL = 'https://portfolio-tracker-141.azurewebsites.net/api/track';

    function deviceType() {
        var ua = navigator.userAgent || '';
        if (/iPad/i.test(ua) || /Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'Tablet';
        if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'Mobile';
        return 'Desktop';
    }

    function visitorId() {
        try {
            var id = window.localStorage.getItem('pt_visitor');
            if (!id) {
                id = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
                window.localStorage.setItem('pt_visitor', id);
            }
            return id;
        } catch (e) {
            return 'v-' + Math.random().toString(36).slice(2, 10);
        }
    }

    /* The path includes the section hash, so navigating to a portfolio
       section (e.g. /#about, /#work) records as its own path in
       Top paths. Without the hash every visit is just "/". */
    function currentPage() {
        return window.location.pathname + (window.location.hash || '');
    }

    function send(type, label, pageOverride) {
        var payload = {
            type: type,
            label: label || '',
            page: pageOverride || currentPage(),
            visitorId: visitorId(),
            device: deviceType()
        };
        try {
            var data = JSON.stringify(payload);
            if (navigator.sendBeacon) {
                /* text/plain keeps the beacon a CORS-simple request, so no
                   preflight is needed. The body is still JSON and the
                   endpoint parses it as JSON. application/json here would
                   force a preflight that beacons cannot perform, and the
                   event would be dropped silently. */
                navigator.sendBeacon(TRACK_URL, new Blob([data], { type: 'text/plain' }));
            } else {
                fetch(TRACK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: data,
                    keepalive: true
                }).catch(function () {});
            }
        } catch (e) {
            /* Tracking must never break the site. */
        }
    }

    function isPdfLink(a) {
        var href = a.getAttribute('href') || '';
        return /\.pdf($|[?#])/i.test(href);
    }

    function isProjectLink(a) {
        if (a.classList && a.classList.contains('drawer-action')) return true;
        var work = document.getElementById('work');
        if (work && work.contains(a)) {
            var href = a.getAttribute('href') || '';
            return href.indexOf('http') === 0;
        }
        return false;
    }

    document.addEventListener('DOMContentLoaded', function () {
        send('pageview', '');

        document.addEventListener('click', function (event) {
            var t = event.target;
            if (!t || !t.closest) return;

            /* Project card: opening a project drawer is a distinct view,
               so record it as its own logical path (/#project-finguard,
               /#project-cloud-atlas, /#project-signal-noise). The card
               itself is not a link, so this runs before the anchor logic. */
            var card = t.closest('[data-testid="project-finguard-card"], [data-testid="project-cloud-atlas-card"], [data-testid="project-signal-noise-card"]');
            if (card) {
                var slug = card.getAttribute('data-testid').replace(/^project-/, '').replace(/-card$/, '');
                send('pageview', '', window.location.pathname + '#project-' + slug);
                return;
            }

            /* Resume modal open: a distinct view, record as /#resume.
               The open control is a <button>, not a link. */
            if (t.closest('.open-resume-modal-btn')) {
                send('pageview', '', window.location.pathname + '#resume');
                return;
            }

            var a = t.closest('a');
            if (!a) return;
            var href = a.getAttribute('href') || '';
            if (a.id === 'contact-email-link' || href.indexOf('mailto:') === 0) {
                send('contact', href);
                return;
            }
            if (isPdfLink(a)) {
                send('resume_download', href);
                return;
            }
            if (isProjectLink(a)) {
                send('project_click', href);
                return;
            }
            /* Section nav links: record a pageview for the section path.
               Click-based, not hashchange-based, because the site's smooth
               scroll handles nav clicks without firing hashchange. The
               hash has not updated yet at click time, so pass the target
               path explicitly. */
            if (href.indexOf('#') === 0 && href.length > 1) {
                send('pageview', '', window.location.pathname + href);
            }
        });
    });
})();
