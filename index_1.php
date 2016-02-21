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
 //$console = system("xelatex {$base}" );
//header('Content-Type: application/pdf; charset=UTF-8');
 // We'll be outputting a PDF
header('Content-Type: application/pdf');

// It will be called downloaded.pdf
//header('Content-Disposition: attachment; filename="downloaded.pdf"');

$pdf = dirname(realpath($console)).DIRECTORY_SEPARATOR.$base.".pdf";

readfile($pdf);
 exit();
 
?>
