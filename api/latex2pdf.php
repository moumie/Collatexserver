<?php

  /* 
     * Author: Soulemane Moumie
     * Operation: conversion
     * Description: convert latex to pdf
     * History:
     */
     
   // $params="$_POST";
  
     
    if(isset($_POST['file_id'])) {
      $file_id=$_POST['file_id'];
    }
    else{
      $message="file_id not set";
      send_bad_request($message);
      return false;
    }
    
    if(isset($_POST['file_content'])) {
      $file_content=$_POST['file_content'];
    }
    else{
      $message="file_content not set xx ".$file_id;
      send_bad_request($message);
      return false;
    }
    
   
 
 ob_start();
 //include 'latex_template.php';
 //$outputData .=ob_get_contents();
 $outputData .=$file_content;
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
 $filename= $teile[0].".tmp.pdf"; // Teil1
 $filenames=$teile[0];
 $p=$filename;
 $out = explode(".", $filename);
 $out_pdf= $out[0].".pdf";
 //copy('C:\Users\soulemane\AppData\Local\Temp\\'.$p, 'E:\2015\xampp\htdocs\collatexserver\api\\'.$p);
  copy('C:\Users\soulemane\AppData\Local\Temp\\'.$p, 'E:\2015\xampp\htdocs\collatexserver\api\pdf\\'.$out_pdf);
  
  //$filename =  $file_content;
 send_convert_success($out_pdf);

    /*
    try
    {
        
    
    
      send_convert_success();
    }
    catch(PDOException $ex)
    {
      send_error($ex->getMessage());
      return false;
    }
    */


function send_json_reply($data){
  echo json_encode($data);
  exit;
}

function send_convert_success($message) {
  http_response_code(200);
  send_json_reply($message);
}
/*
function send_convert_success() {
  http_response_code(200);
  send_json_reply("success");
}
 */

function send_bad_request($message){
  http_response_code(400);
  send_json_reply($message);
}
?>
