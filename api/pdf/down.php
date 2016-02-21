<?php
/*
if(isset($_POST['file_id'])) {
      $file_id=$_POST['file_id'];
    }
    else{
      $message="file_id not set";
      send_bad_request($message);
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
    if(isset($_GET['file_content'])) {
      $file_content=$_GET['file_content'];
    }
    else{
      $message="file_content not set";
      send_bad_request($message);
      return false;
    }

$filenames=trim($file_content, '"');
header('Pragma: public');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Cache-Control: private', false); // required for certain browsers 
header('Content-Type: application/pdf');

header('Content-Disposition: attachment; filename="'. basename($filenames) . '";');
header('Content-Transfer-Encoding: binary');
header('Content-Length: ' . filesize($filenames));

readfile($filenames);
exit;
 /*
send_convert_success(trim($file_content, '"'));

 */
 