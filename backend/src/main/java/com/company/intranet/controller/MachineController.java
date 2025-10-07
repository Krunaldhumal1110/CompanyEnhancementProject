
package com.company.intranet.controller;

import com.company.intranet.entity.Machine;
import com.company.intranet.repository.MachineRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/machines")
@CrossOrigin
public class MachineController {
    private final MachineRepository machineRepository;
    public MachineController(MachineRepository machineRepository) {
        this.machineRepository = machineRepository;
    }
    @GetMapping
    public List<Machine> getAll() {
        return machineRepository.findAll();
    }
    @GetMapping("/completed")
    public List<Machine> getCompleted() {
        return machineRepository.findByCompletedTrue();
    }
    @GetMapping("/{id}")
    public Machine getById(@PathVariable Long id) {
        return machineRepository.findById(id).orElse(null);
    }
    @PostMapping("/{id}/complete")
    public Machine markComplete(@PathVariable Long id) {
        Optional<Machine> m = machineRepository.findById(id);
        if (m.isPresent()) {
            Machine machine = m.get();
            machine.setCompleted(true);
            machine.setStatus("COMPLETE");
            return machineRepository.save(machine);
        }
        return null;
    }
    @GetMapping("/{id}/drawing")
    public ResponseEntity<byte[]> getDrawing(@PathVariable Long id) {
        Optional<Machine> m = machineRepository.findById(id);
        if (m.isPresent() && m.get().getElectricDrawingPath() != null) {
            try {
                File file = new File(m.get().getElectricDrawingPath());
                byte[] content = Files.readAllBytes(file.toPath());
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("attachment", file.getName());
                return ResponseEntity.ok().headers(headers).body(content);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<String> addMachine(
            @RequestParam("name") String name,
            @RequestParam("status") String status,
            @RequestParam("completed") Boolean completed,
            @RequestParam("masterCardInfo") String masterCardInfo,
            @RequestParam("electricDrawingPath") String electricDrawingPath,
            @RequestParam("machineNo") String machineNo,
            @RequestParam("model") String model,
            @RequestParam("productNo") String productNo,
            @RequestParam("blockNo") Integer blockNo,
            @RequestPart("pdf") MultipartFile pdf
    ) {
        if (blockNo == null || blockNo < 1 || blockNo > 12) {
            return ResponseEntity.badRequest().body("Block number must be between 1 and 12.");
        }
        if (machineRepository.existsByBlockNo(blockNo)) {
            return ResponseEntity.badRequest().body("Block number already occupied.");
        }
        String uploadDir = "uploads";
        String pdfPath = null;
        try {
            if (pdf != null && !pdf.isEmpty()) {
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();
                String fileName = System.currentTimeMillis() + "_" + pdf.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                pdf.transferTo(filePath);
                pdfPath = filePath.toString();
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
        Machine machine = Machine.builder()
                .name(name)
                .status(status)
                .completed(completed)
                .masterCardInfo(pdfPath)
                .electricDrawingPath(electricDrawingPath)
                .machineNo(machineNo)
                .model(model)
                .productNo(productNo)
                .blockNo(blockNo)
                .build();
        machineRepository.save(machine);
        return ResponseEntity.ok("File uploaded successfully: " + (pdfPath != null ? pdfPath : "no file"));
    }
    @DeleteMapping("/{id}")
    public void deleteMachine(@PathVariable Long id) {
        machineRepository.deleteById(id);
    }
    @PostMapping(path = "/{id}/drawing", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadElectricDrawing(@PathVariable Long id, @RequestPart("drawing") MultipartFile drawing) {
        Optional<Machine> m = machineRepository.findById(id);
        if (m.isEmpty()) {
            return ResponseEntity.badRequest().body("Machine not found");
        }
        String uploadDir = "uploads";
        String drawingPath = null;
        try {
            if (drawing != null && !drawing.isEmpty()) {
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();
                String fileName = System.currentTimeMillis() + "_drawing_" + drawing.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                drawing.transferTo(filePath);
                drawingPath = filePath.toString();
                Machine machine = m.get();
                machine.setElectricDrawingPath(drawingPath);
                machineRepository.save(machine);
            } else {
                return ResponseEntity.badRequest().body("No drawing file uploaded");
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
        return ResponseEntity.ok("Electric drawing uploaded successfully: " + drawingPath);
    }

        @GetMapping("/{id}/mastercard")
    public ResponseEntity<byte[]> getMasterCard(@PathVariable Long id) {
        Optional<Machine> m = machineRepository.findById(id);
        if (m.isPresent() && m.get().getMasterCardInfo() != null) {
            try {
                File file = new File(m.get().getMasterCardInfo());
                byte[] content = Files.readAllBytes(file.toPath());
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("inline", file.getName());
                return ResponseEntity.ok().headers(headers).body(content);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/drawingpdf")
    public ResponseEntity<byte[]> getDrawingPdf(@PathVariable Long id) {
        Optional<Machine> m = machineRepository.findById(id);
        if (m.isPresent() && m.get().getElectricDrawingPath() != null) {
            try {
                File file = new File(m.get().getElectricDrawingPath());
                byte[] content = Files.readAllBytes(file.toPath());
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("inline", file.getName());
                return ResponseEntity.ok().headers(headers).body(content);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(path = "/{id}/mastercard", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadMasterCard(@PathVariable Long id, @RequestPart("mastercard") MultipartFile mastercard) {
        Optional<Machine> m = machineRepository.findById(id);
        if (m.isEmpty()) {
            return ResponseEntity.badRequest().body("Machine not found");
        }
        String uploadDir = "uploads";
        String cardPath = null;
        try {
            if (mastercard != null && !mastercard.isEmpty()) {
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();
                String fileName = System.currentTimeMillis() + "_mastercard_" + mastercard.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                mastercard.transferTo(filePath);
                cardPath = filePath.toString();
                Machine machine = m.get();
                machine.setMasterCardInfo(cardPath);
                machineRepository.save(machine);
            } else {
                return ResponseEntity.badRequest().body("No master card file uploaded");
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
        return ResponseEntity.ok("Master card uploaded successfully: " + cardPath);
    }
}
