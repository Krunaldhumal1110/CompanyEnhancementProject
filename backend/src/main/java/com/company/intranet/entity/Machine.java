package com.company.intranet.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "machine")
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
    @Column(name = "block_no")
    // Note: blockNo is not enforced unique at the JPA level. Backend logic treats only non-completed
    // machines as occupying a block; completed machines are considered free for reuse.
    private Integer blockNo;
}
