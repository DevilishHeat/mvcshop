<?php
  function includeTemplate($path) 
  {
    /* Вспомогательная функция подключения файлов из других директорий */
    include($_SERVER['DOCUMENT_ROOT'].$path);
  }
?>