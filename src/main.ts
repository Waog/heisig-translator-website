import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log(
          'Service Worker registered with scope:',
          registration.scope
        );

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Neue Version verfügbar
                  console.log('Neue Version verfügbar. Jetzt aktualisieren?');
                  if (confirm('Neue Version verfügbar. Jetzt aktualisieren?')) {
                    window.location.reload();
                  }
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });

    // Überprüfen, ob der Service Worker aktiviert und installiert ist
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  });
}
