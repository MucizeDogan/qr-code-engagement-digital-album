# İrem & Doğan Dijital Anı Albümü

Bu proje, 08.08.2026 nişan töreni için QR kod ile açılacak mobil odaklı bir anı paylaşım sayfasıdır.

## Çalıştırma

`index.html` dosyasını tarayıcıda açman yeterli. Backend gerekmiyor; medya yükleme Cloudinary unsigned upload preset ile doğrudan tarayıcıdan yapılır.

## Cloudinary ayarı

Cloudinary Dashboard içinde şu iki bilgiye ihtiyacın var:

- `Cloud name`: Dashboard ana ekranında yazar.
- `Upload preset`: Settings > Upload > Upload presets altında oluşturduğun unsigned preset adı.

[script.js](script.js) içindeki şu iki alan dolu olmalı:

```js
const CLOUDINARY_CLOUD_NAME = "dovxqvdl5";
const CLOUDINARY_UPLOAD_PRESET = "mucizeTest";
```

Upload endpoint otomatik olarak şu hale gelir:

```text
https://api.cloudinary.com/v1_1/<cloud_name>/auto/upload
```

`auto` kullandığımız için fotoğraf ve video aynı endpoint üzerinden yüklenebilir.

## Upload preset önerisi

Preset ayarında:

- Signing mode: Unsigned
- Folder: `irem-dogan/2026-08-08` veya benzeri bir klasör
- Allowed formats: `jpg,png,heic,webp,mp4,mov,webm`
- Max file size: Tören için makul bir limit belirle

Uygulama ayrıca dosyalara `irem-dogan`, `nisan`, `qr-ani-albumu` etiketlerini ve misafir adını context olarak gönderir.

## Çoklu yükleme notu

Yükleme başarılı bitince seçilen dosyalar tarayıcı hafızasından temizlenir. Aynı misafir tekrar yükleme yapmak isterse eski dosyalar yeniden gönderilmez.

Büyük JPG/PNG/WEBP fotoğraflar yükleme öncesi tarayıcıda küçültülür. Buna rağmen bir dosya Cloudinary limitine, preset format kısıtına veya ağ hatasına takılırsa uygulama aynı dosyayı 3 kez tekrar dener ve sonra hangi dosyada hata olduğunu ekranda gösterir.

## Çift fotoğrafı

Arka plan fotoğrafı için şu dosyayı ekle:

```text
assets/irem-dogan.jpg
```

Dosya yoksa sayfa yine çalışır, fakat asıl görsel yerine sade bir arka plan görünür.
