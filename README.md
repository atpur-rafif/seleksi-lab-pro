# Seleksi LabPro

## Identitas
Nama: Muhammad Atpur Rafif  
NIM: 13522086  

## Cara Menjalankan
Database yang digunakan adalah sqlite, sehingga tidak memerlukan dua container. Menjalankan program dapat dilakukan dengan docker menggunakan perintah  
```
docker compose up
```

Jika ingin menjalankan seperti biasa, berikut merupakan langkahnya:
1. Install dependensi `npm i`
1. Transpile typescript ke javascript `node build.mjs`
1. Jalankan program `node dist.js`

Catatan: Pada admin menggunakan username berupa `admin` dan password berupa `adminaadmin`. Sedangkan tidak terdapat pengguna biasa secara default.  

## Design Pattern
1. Strategy: Secara garis besar, pada sebuah server, router merupakan penentu fungsi yang dijalankan ketika client melakukan request. Pada kode ini, terdapat kelas `PathInvoker` yang kita dapat definisikan konfigurasi path dan fungsi (atau strategi). Lalu diturunkan menjadi kelas `Router` untuk mendukung method pada request. Terdapat method `defineRoute` untuk mengkonfigurasikan strategi yang digunakan. Sehingga router ini akan menentuk fungsi (atau strategi) yang harus dijalankan sesuai konfigurasi yang diberikan.
1. Observer: Melakukan parsing request body dapat membutuhkan waktu yang lama, terutama ketika file yang diunggah cukup besar. Oleh karena itu, `busboy` menggunakan fitur callback agar tidak terjadi blocking, sehingga request lain dapat dilayani. Callback ini seperti fungsi yang dijalankan ketika `busboy` menghasilkan sebuah event tertentu. Misalkan ketika pada request body ditemukan sebuah field, maka fungsi yang telah diregistrasi untuk dipanggil akan dijalankan.
1. Adapter: Library `busboy` tidak menggunakan Promise API, namun menggunakan callback. Oleh karena itu, kelas `FormDataParser` membungkus library ini agar dapat dijalankan menggunakan Promise API, sehingga kode lebih rapi menggunakan async/await dibandingkan dengan callback hell.

## Technology Stack
Typescript digunakan dikarenakan bahasa ini memiliki fitur typesafe, dibandingkan dengan javascript yang rentan dengan bug. Transpilasi dan bundling dilakukan menggunakan esbuild. Server http sendiri menggunakan built-in nodejs. Kemudian terdapat penggunaan beberapa library, seperti berikut:  
1. busboy: parsing multipart/form-data  
1. cookie: parsing cookie (duh)  
1. bcryptjs: hashing password  
1. mime: file type  
1. typeorm: object relational mapper (duh)  
1. jsonwebtoken: authorization menggunakan jwt  

Penggunaan library ini sebagian besar dikarenakan tidak ingin membuat program dari dasar. Seperti parser multipart/form-data yang implementasinya tidak trivial. Atau mime yang dapat diimplementasi dengan key-value pair, namun mencakup banyak tipe file yang ada lebih mudah menggunakan library.  

## Endpoint
Pada fitur admin, endpoints dibuat sesuai dengan spesifikasi pada dokumen, atau implementasi yang dibuat oleh repository frontend admin. Kemudian berikut merupakan endpoints pada fitur user bias  
1. `/user-register`: melakukan pendaftaran pengguna baru  
1. `/user-login`: melakukan login  
1. `/browse`: mencari film dengan filter  
1. `/film-detail/:id`: detail mengenai film  

## Bonus
Jelas tidak ada.
