cd /lib_titanium_workspace/Crosspad
ant update
ti build --platform android --force --build-only --project-dir /lib_titanium_workspace/Crosspad --log-level error
cp -i build/android/bin/app.apk ~/Desktop