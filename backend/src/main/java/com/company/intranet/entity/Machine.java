package com.company.intranet.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "machine", uniqueConstraints = {@UniqueConstraint(columnNames = {"blockNo"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Machine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String status;
    private boolean completed;
    private String masterCardInfo;
    private String electricDrawingPath;
    private String machineNo;
    private String model;
    private String productNo;
    @Column(unique = true)
    private Integer blockNo;
}
