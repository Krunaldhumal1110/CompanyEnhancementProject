package com.company.intranet.controller;

import com.company.intranet.entity.QCForm;
import com.company.intranet.repository.QCFormRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.nio.file.Files;
import java.util.Optional;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import java.io.FileOutputStream;
import java.nio.file.Paths;
// import java.util.UUID;

import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/qc")
@CrossOrigin
public class QCFormController {
	private final QCFormRepository qcFormRepository;

	public QCFormController(QCFormRepository qcFormRepository) {
		this.qcFormRepository = qcFormRepository;
	}

	// New endpoint: get QC forms by machineId
	@GetMapping("")
	public ResponseEntity<?> getQCFormsByMachineId(@RequestParam Long machineId) {
		return ResponseEntity.ok(qcFormRepository.findByMachineId(machineId));
	}

	@GetMapping("/{qcId}/pdf")
	public ResponseEntity<byte[]> getQcFormPdf(@PathVariable Long qcId) {
		Optional<QCForm> qcOpt = qcFormRepository.findById(qcId);
		if (qcOpt.isEmpty() || qcOpt.get().getPdfPath() == null) {
			return ResponseEntity.notFound().build();
		}
		try {
			File file = new File(qcOpt.get().getPdfPath());
			byte[] content = Files.readAllBytes(file.toPath());
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_PDF);
			// headers.setContentDispositionFormData("inline", file.getName());
			headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"");
			return ResponseEntity.ok().headers(headers).body(content);
		} catch (Exception e) {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping("/{qcId}/pdf/download")
	public ResponseEntity<byte[]> getQcFormPdfDownload(@PathVariable Long qcId) {
		Optional<QCForm> qcOpt = qcFormRepository.findById(qcId);
		if (qcOpt.isEmpty() || qcOpt.get().getPdfPath() == null) {
			return ResponseEntity.notFound().build();
		}
		try {
			File file = new File(qcOpt.get().getPdfPath());
			byte[] content = Files.readAllBytes(file.toPath());
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_PDF);
			headers.setContentDispositionFormData("inline", file.getName());
			// headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"");
			return ResponseEntity.ok().headers(headers).body(content);
		} catch (Exception e) {
			return ResponseEntity.notFound().build();
		}
	}

	@PostMapping("")
	public ResponseEntity<QCForm> submitQCForm(@RequestBody QCForm form) {
		// Save form first to get ID
		QCForm saved = qcFormRepository.save(form);
		try {
			// Generate PDF
			String filename = "qcform-" + saved.getId() + "-" + System.currentTimeMillis() + ".pdf";
			String uploadDir = "uploads/qcforms";
			java.nio.file.Files.createDirectories(Paths.get(uploadDir));
			String pdfPath = Paths.get(uploadDir, filename).toString();
			PdfWriter writer = new PdfWriter(new FileOutputStream(pdfPath));
			PdfDocument pdfDoc = new PdfDocument(writer);
			Document document = new Document(pdfDoc);
			document.add(new Paragraph("QC Form ID: " + saved.getId()));
			document.add(new Paragraph("Machine ID: " + saved.getMachineId()));
			document.add(new Paragraph("Inspector Name: " + (form.getInspectorName() != null ? form.getInspectorName() : "")));
			document.add(new Paragraph("Status: " + (form.getStatus() != null ? form.getStatus() : "")));
			document.add(new Paragraph("Remarks: " + (form.getRemarks() != null ? form.getRemarks() : "")));
			document.close();
			// Update QCForm with pdfPath
			saved.setPdfPath(pdfPath);
			qcFormRepository.save(saved);
		} catch (Exception e) {
			// Optionally log error
		}
		return new ResponseEntity<>(saved, HttpStatus.CREATED);
	}
}
