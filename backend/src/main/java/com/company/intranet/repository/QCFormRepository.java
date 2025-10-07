package com.company.intranet.repository;

import com.company.intranet.entity.QCForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QCFormRepository extends JpaRepository<QCForm, Long> {
	List<QCForm> findByMachineId(Long machineId);
}
