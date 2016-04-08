<?php
$string = 'I want characters at the end to be removed';
echo rtrim($string, '\doc\\');

$d = getcwd();
echo 'Current dir : '.$d."\doc\\";
$filename = tempnam('doc\\', 'cre');

//echo'path: '.$filename;
$fp = fopen($filename, 'w+');
fwrite($fp, 'store temporary data in a file');
echo'hi soulemane';
fclose($fp);
//unlink($filename);

?>

