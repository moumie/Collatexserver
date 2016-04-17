<?php

    /* 
     * Author: Soulemane Moumie
     * Operation: conversion
     * Description: convert latex to pdf
     * History:
     */
     
    //Checking that the received variable are set
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
//start the buffer   
 ob_start();
 $outputData .=$file_content;
 
 //End the buffer
 ob_end_clean();
 
 //Create a unique file in the doc folder
 $texFile = tempnam('doc', 'doc');
 
 //Extract the filename from the path 
 $base = basename($texFile);
 
 //Add .tex extension the file filename
 rename($texFile, $texFile.".tex");
 $texFile .= ".tex";
 
 //Write buffered data to the tex file
 file_put_contents($texFile,  $outputData);
 
 //Change current directory
 chdir(dirname(realpath($texFile)));
 
 //Conversion to pdf using xelatex
  //$console = shell_exec("xelatex {$base}" );
  $console = exec("pdflatex {$base}" );

 //Building path
 $pdf = dirname(realpath($console))."/".$base.".pdf";
 $a=$base.".pdf";
 $teile = explode(".", $a);
 //$filename= $teile[0].".tmp.pdf"; // For Windows

 $filename= $teile[0].".pdf"; // For linux
 $filenames=$teile[0];
 
 //To be used later
 $p=$filename;
 
 //Final pdf filename
 $out = explode(".", $filename);
 $out_pdf= $out[0].".pdf";
 
 //Get current dir
 $currentdir = getcwd();
 
 //remove the suffix \doc\ at the end of the current directory
 $currentdirpdf = rtrim($currentdir, '/doc/');
 //echo $currentdir;
 copy($currentdir.'/'.$p, $currentdirpdf.'/pdf/'.$out_pdf);
  
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


//Data to json mapping
function send_json_reply($data){
  echo json_encode($data);
  exit;
}

//Success error code
function send_convert_success($message) {
  http_response_code(200);
  send_json_reply($message);
}

//Bad request error code
function send_bad_request($message){
  http_response_code(400);
  send_json_reply($message);
}
?>
