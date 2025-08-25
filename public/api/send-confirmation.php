<?php
// Simple mail endpoint for WebSupport shared hosting.
// Expects JSON: { to, subject, text?, html? }
// Sends from swimtest@swimtest.sk

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([ 'ok' => false, 'error' => 'Method Not Allowed' ]);
  exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) {
  http_response_code(400);
  echo json_encode([ 'ok' => false, 'error' => 'Invalid JSON' ]);
  exit;
}

$to = isset($payload['to']) ? trim($payload['to']) : '';
$subject = isset($payload['subject']) ? trim($payload['subject']) : '';
$text = isset($payload['text']) ? (string)$payload['text'] : null;
$html = isset($payload['html']) ? (string)$payload['html'] : null;

if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode([ 'ok' => false, 'error' => 'Invalid recipient' ]);
  exit;
}
if ($subject === '') {
  http_response_code(400);
  echo json_encode([ 'ok' => false, 'error' => 'Missing subject' ]);
  exit;
}
if (($text === null || $text === '') && ($html === null || $html === '')) {
  http_response_code(400);
  echo json_encode([ 'ok' => false, 'error' => 'Missing message body' ]);
  exit;
}

$isHtml = ($html !== null && $html !== '');
$message = $isHtml ? $html : $text;

$fromEmail = 'swimtest@swimtest.sk';
$fromName = 'SwimShark';
$headers = 'From: ' . $fromName . ' <' . $fromEmail . ">\r\n" .
           'Reply-To: ' . $fromName . ' <' . $fromEmail . ">\r\n" .
           'MIME-Version: 1.0' . "\r\n" .
           'Content-Type: ' . ($isHtml ? 'text/html' : 'text/plain') . '; charset=UTF-8' . "\r\n";

// Use -f to set the envelope sender (improves deliverability on WebSupport)
$params = '-f' . $fromEmail;

$ok = @mail($to, $subject, $message, $headers, $params);
if (!$ok) {
  http_response_code(500);
  echo json_encode([ 'ok' => false, 'error' => 'Send failed' ]);
  exit;
}

echo json_encode([ 'ok' => true ]);
