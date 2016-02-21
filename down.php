<?php
$filenames="tesC5F6.pdf";
header('Pragma: public');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Cache-Control: private', false); // required for certain browsers 
header('Content-Type: application/pdf');

header('Content-Disposition: attachment; filename="'. basename($filenames) . '";');
header('Content-Transfer-Encoding: binary');
header('Content-Length: ' . filesize($filenames));

readfile($filenames);

