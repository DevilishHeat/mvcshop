<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>💫</title>
	
	<link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap&subset=cyrillic" rel="stylesheet">
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
	<link rel="stylesheet" href="assets/css/vendor.css">
	<link rel="stylesheet" href="assets/css/main.css">
</head>

	<body class="body">
		<div class="body__wrapper">
			<div class="body__header">
				<?php include 'views/header.php'; ?>
			</div>
			<main class="body__content container pt-5 pb-5">
				<div class="row">
					<div class="col-3 pt-5">
						<?php include 'views/view_sidebar.php'?>
					</div>
					<div class="col-9">
						<?php include 'views/'.$content_view; ?>
					</div>
				</div>
			</main>
			<div class="body__footer">
				<?php include 'views/footer.php'; ?>
			</div>
		</div>
		
		<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>

		<script src="assets/scripts/bundle.js" defer></script>
	</body>
</html>
