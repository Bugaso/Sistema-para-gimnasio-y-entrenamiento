# Sistema-para-gimnasio-y-entrenamiento

⚙️ Configuración del entorno y parámetros modificablesEl proyecto utiliza variables de entorno con valores por defecto en src/main/resources/application.properties. La aplicación arranca correctamente sin necesidad de configurar el correo, pero si desea probar el envío de credenciales o recuperación de contraseña, puede ajustar los siguientes parámetros:

1. Base de Datos (MySQL / MariaDB)
   DB_HOST / DB_PORT / DB_NAME: Por defecto apunta a localhost:3306/gym_atlas.
   
   La base de datos se generara automaticamente en caso que en aplication.properties la variable spring.jpa.hibernate.ddl-auto esté en update o create-only, en caso
   de estar en validate se recomienda cambiar ese parametro a update.
   
   Si es la primera vez que inicia la aplicacion, se generara un usuario administrador al cual se le puede cambiar los datos, incluso eliminar, el objetivo es que
   ese usuario permita crear al primer usuario real, se sugiere que el nuevo usuario tenga rol admin y que al eliminar al actual usuario se reinicie la pagina.
   
   
3. DB_USER / DB_PASS: Credenciales de acceso a su motor de base de datos local (por defecto root).
4. Servicio de Correo SMTP (Opcional)
5. 
   El sistema utiliza Gmail (smtp.gmail.com, puerto 587 con STARTTLS).
   
   MAIL_USER: Dirección de Gmail desde la cual se enviarán las notificaciones.
   MAIL_PASS: Contraseña de aplicación de 16 caracteres generada desde la cuenta de Google (no utilizar la contraseña habitual de inicio de sesión).
   
   Nota: Si estos valores no se configuran, el sistema funcionará con normalidad en todos sus módulos excepto al disparar el envío de correos (donde devolverá un
   error controlado de autenticación SMTP).

7. Puerto del Servidor
   server.port:Configurado en 8080 por defecto. En caso de conflicto con otro servicio local, puede modificarse en application.properties o mediante
   server.port=8081.
