<?php

 ob_start();
 include 'latex_template.php';
 $outputData .=ob_get_contents();
 ob_end_clean();
 $texFile = tempnam(sys_get_temp_dir(), 'test');
 $base = basename($texFile);
 rename($texFile, $texFile.".tex");
 $texFile .= ".tex";
 file_put_contents($texFile,  $outputData);
 chdir(dirname(realpath($texFile)));
 $console = shell_exec("xelatex {$base}" );
 $pdf = dirname(realpath($console))."/".$base.".pdf";
 $a=$base.".pdf";
 $teile = explode(".", $a);
 $filename= $teile[0].".pdf"; // Teil1
 $filenames=$teile[0];
 $p='/'.$filename;
 copy('C:\Users\soulemane\AppData\Local\Temp'.$p, 'E:\2015\xampp\htdocs\collatexserver'.$p);

exit;

?>


