<?php
/*
	 check php.ini variables: ------
	      post_max_size = 128M
          upload_max_filesize = 128M
		  error_log = php_errors.log
*/

    $file_path = "uploads/";		// server file-system location to save files (must exist)
	$header_tag = "url";		// required value in form doing the submission
    $username = $_POST["Username"];	// optional
     
     /*
     Single upload
    $file_path = $file_path . basename( $_FILES[$header_tag ]['name']);
    if(move_uploaded_file($_FILES[$header_tag ]['tmp_name'], $file_path)) {
        echo "success user ".$username;
    } else{
        echo "fail user ".$username;
    }
    */
    
    //Loop through each file submitted for upload:
    $success = array();
	$failure = array();
	$nFiles = count($_FILES[$header_tag]["name"]);
    message("Number of files tagged with '$header_tag':" . $nFiles);
	message( "..  ".implode("|",$_FILES[$header_tag]));
	
	for($i=0; $i<$nFiles ; $i++) {
		$error = $_FILES[$header_tag ]["error"][$i];
		if ($error == UPLOAD_ERR_OK) {  // then there is at least one file...
		   $current_file_num = $i + 1;
		   
		  //------ Get the temp (system/PHP generated) file path ------
		  $tmpFilePath = $_FILES[$header_tag]["tmp_name"];
		  message("..  Temp filename #".$current_file_num.": " . $tmpFilePath);
		  
		  //------ Make sure we have a file pathname ------
		  if ($tmpFilePath != ""){
			  
			//------ Setup our new file path ------
			$newFilePath = $file_path . basename($_FILES[$header_tag ]["name"]);
			
			//  Todo: sanitize filename by checking length, valid characters, etc
			message("..  New  filename #".$current_file_num.": " . $newFilePath);
			
			//------ Check if file already exists ------
			if (file_exists($newFilePath)) {
				message( "..  Replaced existing file.");
				unlink($newFilePath);
			}
			
			//------ Move the file into the target dir ------
			if(move_uploaded_file($tmpFilePath, $newFilePath)) {
				$success[] = $newFilePath;
			}else{
				$failure[] = $newFilePath;
			}
		  }
		}
		message("");
	}
	
	//------ Respond with some JSON text ------
	$result = array("Username" => $username, "Success"=>$success,"Failure"=>$failure);
	echo json_encode($result);
	
function message($message){
//		echo $message ."<BR>";
		// writes to php_errors.log in the same folder as this php file:
		error_log($message);
}
 ?>