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
$attachment = isset($payload['attachment']) && is_array($payload['attachment']) ? $payload['attachment'] : null; // { filename, content_base64, content_type }

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
// Multipart if attachment present
$boundary = 'bnd_' . md5(uniqid((string)mt_rand(), true));
$hasAttachment = ($attachment && isset($attachment['content_base64']) && isset($attachment['filename']));

if ($hasAttachment) {
  $headers = 'From: ' . $fromName . ' <' . $fromEmail . ">\r\n" .
             'Reply-To: ' . $fromName . ' <' . $fromEmail . ">\r\n" .
             'MIME-Version: 1.0' . "\r\n" .
             'Content-Type: multipart/mixed; boundary="' . $boundary . '"' . "\r\n";

  $body  = "--$boundary\r\n";
  $body .= 'Content-Type: ' . ($isHtml ? 'text/html' : 'text/plain') . '; charset=UTF-8' . "\r\n\r\n";
  $body .= $message . "\r\n\r\n";

  $filename = preg_replace('/[\r\n]+/', '', (string)$attachment['filename']);
  $ctype = isset($attachment['content_type']) && $attachment['content_type'] ? $attachment['content_type'] : 'application/octet-stream';
  $content = base64_decode((string)$attachment['content_base64']);
  if ($content === false) {
    http_response_code(400);
    echo json_encode([ 'ok' => false, 'error' => 'Invalid attachment encoding' ]);
    exit;
  }
  $body .= "--$boundary\r\n";
  $body .= 'Content-Type: ' . $ctype . '; name="' . $filename . '"' . "\r\n";
  $body .= 'Content-Transfer-Encoding: base64' . "\r\n";
  $body .= 'Content-Disposition: attachment; filename="' . $filename . '"' . "\r\n\r\n";
  $body .= chunk_split(base64_encode($content)) . "\r\n";
  $body .= "--$boundary--";
} else {
  $headers = 'From: ' . $fromName . ' <' . $fromEmail . ">\r\n" .
             'Reply-To: ' . $fromName . ' <' . $fromEmail . ">\r\n" .
             'MIME-Version: 1.0' . "\r\n" .
             'Content-Type: ' . ($isHtml ? 'text/html' : 'text/plain') . '; charset=UTF-8' . "\r\n";
  $body = $message;
}

// Use -f to set the envelope sender (improves deliverability on WebSupport)
$params = '-f' . $fromEmail;

$ok = @mail($to, $subject, $body, $headers, $params);
if (!$ok) {
  http_response_code(500);
  echo json_encode([ 'ok' => false, 'error' => 'Send failed' ]);
  exit;
}

echo json_encode([ 'ok' => true ]);
